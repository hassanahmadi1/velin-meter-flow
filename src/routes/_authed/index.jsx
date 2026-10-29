const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Coins, Eye, Package, ShoppingBag, Wallet } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import VisitsChart from "@/components/dashboard/VisitsChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import { fetchList, sumBy } from "@/lib/db";
import { faNumber, money, percent, todayISO } from "@/lib/format";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "داشبورد | پنل مدیریت ولین" }] }),
  component: DashboardPage,
});

const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [visits, setVisits] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [orderRows, visitRows, ticketRows, productRows] = await Promise.all([
      fetchList(db.entities.Order, {}, { limit: 200 }),
      fetchList(db.entities.Visit, {}, { limit: 60 }),
      fetchList(db.entities.Ticket, {}, { limit: 50 }),
      fetchList(db.entities.Product, {}, { limit: 100 }),
    ]);
    setOrders(orderRows);
    setVisits(visitRows);
    setTickets(ticketRows);
    setProducts(productRows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const paid = orders.filter((order) => PAID_STATUSES.includes(order.status));
    const revenue = sumBy(paid, (order) => order.total);
    const pending = orders.filter((order) => order.status === "pending").length;
    const openTickets = tickets.filter((ticket) => ticket.status === "open").length;
    const todayVisits = visits
      .filter((visit) => visit.date === todayISO())
      .reduce((total, visit) => total + (visit.visits || 0), 0);
    const lowStock = products.filter((product) => (product.stock || 0) <= 5 && product.status !== "archived");
    const totalVisits = visits.reduce((total, visit) => total + (visit.visits || 0), 0);
    const conversion = totalVisits ? (paid.length / totalVisits) * 100 : 0;
    const averageBasket = paid.length ? revenue / paid.length : 0;

    return {
      revenue,
      pending,
      openTickets,
      todayVisits,
      lowStock,
      conversion,
      averageBasket,
      customers: new Set(orders.map((order) => order.customer_phone)).size,
    };
  }, [orders, visits, tickets, products]);

  const chartData = useMemo(() => {
    const byDate = new Map();
    visits.forEach((visit) => {
      if (!visit.date) return;
      byDate.set(visit.date, (byDate.get(visit.date) || 0) + (visit.visits || 0));
    });
    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([date, total]) => ({ date, visits: total }));
  }, [visits]);

  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <PageHeader
        title="داشبورد"
        description="نمای کلی فروشگاه ولین: فروش، بازدید و کارهای در انتظار."
        actions={
          <Link
            to="/products"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            مدیریت محصولات
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="درآمد فروش"
          value={loading ? "…" : money(stats.revenue)}
          hint={loading ? "" : `${faNumber(orders.length)} سفارش ثبت شده`}
          icon={Wallet}
          accent
        />
        <StatCard label="سفارشهای در انتظار" value={loading ? "…" : faNumber(stats.pending)} hint="نیازمند بررسی و تایید" icon={ShoppingBag} />
        <StatCard label="تیکتهای باز" value={loading ? "…" : faNumber(stats.openTickets)} hint="پاسخ داده نشده" icon={AlertCircle} />
        <StatCard label="بازدید امروز" value={loading ? "…" : faNumber(stats.todayVisits)} hint={`نرخ تبدیل ${loading ? "…" : percent(stats.conversion)}`} icon={Eye} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel title="بازدید ۱۴ روز اخیر" description="مجموع بازدید روزانه فروشگاه" className="xl:col-span-2">
          {loading ? <div className="h-64 animate-pulse rounded-lg bg-accent/40" /> : <VisitsChart data={chartData} />}
        </Panel>

        <Panel title="خلاصه وضعیت" description="شاخصهای کلیدی فروشگاه">
          <dl className="space-y-3 text-xs">
            {[
              ["میانگین سبد خرید", loading ? "…" : money(stats.averageBasket)],
              ["تعداد مشتریان", loading ? "…" : faNumber(stats.customers)],
              ["نرخ تبدیل", loading ? "…" : percent(stats.conversion)],
              ["محصولات فعال", loading ? "…" : faNumber(products.filter((product) => product.status === "active").length)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="flex items-center gap-2 text-[11px] font-medium text-primary">
              <Coins className="h-3.5 w-3.5" aria-hidden="true" />
              {loading ? "…" : `${faNumber(stats.lowStock.length)} محصول نیاز به تامین موجودی دارد`}
            </p>
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel title="آخرین سفارشها" description="جدیدترین سفارشهای ثبت شده" className="xl:col-span-2">
          {loading ? <div className="h-40 animate-pulse rounded-lg bg-accent/40" /> : <RecentOrders orders={recentOrders} />}
        </Panel>

        <Panel title="موجودی رو به اتمام" description="محصولاتی که باید سفارش داده شوند">
          <ul className="space-y-3">
            {stats.lowStock.slice(0, 5).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{product.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{product.category}</span>
                </span>
                <span className="shrink-0 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] tabular-nums text-amber-300">
                  {faNumber(product.stock)} عدد
                </span>
              </li>
            ))}
            {!loading && stats.lowStock.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">همه محصولات موجودی کافی دارند.</li>
            )}
          </ul>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title="تیکتهای اخیر" bodyClassName="p-0 sm:p-0">
          <ul className="divide-y divide-border/50">
            {tickets.slice(0, 4).map((ticket) => (
              <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs sm:px-5">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{ticket.subject}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {ticket.customer_name} · {faNumber(ticket.messages?.length || 0)} پیام
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </span>
              </li>
            ))}
            {!loading && tickets.length === 0 && (
              <li className="px-5 py-8 text-center text-xs text-muted-foreground">تیکتی ثبت نشده است.</li>
            )}
          </ul>
        </Panel>
      </div>
    </>
  );
}