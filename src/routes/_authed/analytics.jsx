const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, MousePointerClick, ShoppingBag, Zap } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatCard from "@/components/admin/StatCard";
import VisitsChart from "@/components/dashboard/VisitsChart";
import { fetchList } from "@/lib/db";
import { faNumber, money, percent } from "@/lib/format";

export const Route = createFileRoute("/_authed/analytics")({
  head: () => ({ meta: [{ title: "تحلیل و بازدید | پنل مدیریت ولین" }] }),
  component: AnalyticsPage,
});

const SOURCES = {
  instagram: "اینستاگرام",
  google: "جستجوی گوگل",
  direct: "ورود مستقیم",
  telegram: "تلگرام",
  referral: "سایر سایتها",
};

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [visitRows, orderRows, productRows] = await Promise.all([
      fetchList(db.entities.Visit, {}, { limit: 120 }),
      fetchList(db.entities.Order, {}, { limit: 200 }),
      fetchList(db.entities.Product, {}, { limit: 100 }),
    ]);
    setVisits(visitRows);
    setOrders(orderRows);
    setProducts(productRows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const stats = useMemo(() => {
    const totalVisits = visits.reduce((total, visit) => total + (visit.visits || 0), 0);
    const totalViews = visits.reduce((total, visit) => total + (visit.page_views || 0), 0);
    const last7 = chartData.slice(-7).reduce((total, day) => total + day.visits, 0);
    const conversion = totalVisits ? (orders.length / totalVisits) * 100 : 0;
    const revenue = orders
      .filter((order) => !["canceled", "pending"].includes(order.status))
      .reduce((total, order) => total + (order.total || 0), 0);
    return { totalVisits, totalViews, last7, conversion, revenue };
  }, [visits, orders, chartData]);

  const sources = useMemo(() => {
    const totals = new Map();
    visits.forEach((visit) => {
      totals.set(visit.source || "direct", (totals.get(visit.source || "direct") || 0) + (visit.visits || 0));
    });
    const sum = [...totals.values()].reduce((total, value) => total + value, 0) || 1;
    return [...totals.entries()]
      .map(([key, value]) => ({ key, label: SOURCES[key] ?? key, value, share: (value / sum) * 100 }))
      .sort((a, b) => b.value - a.value);
  }, [visits]);

  const topProducts = useMemo(
    () => [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    [products],
  );

  return (
    <>
      <PageHeader title="تحلیل و بازدید" description="رفتار بازدیدکنندگان، منابع ترافیک و محصولات پرطرفدار." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="بازدید کل" value={loading ? "…" : faNumber(stats.totalVisits)} hint="از ابتدای ثبت آمار" icon={Eye} accent />
        <StatCard label="بازدید ۷ روز اخیر" value={loading ? "…" : faNumber(stats.last7)} hint={`${faNumber(stats.totalViews)} بازدید صفحه`} icon={Zap} />
        <StatCard label="سفارشها" value={loading ? "…" : faNumber(orders.length)} hint={`نرخ تبدیل ${loading ? "…" : percent(stats.conversion)}`} icon={ShoppingBag} />
        <StatCard label="درآمد محقق شده" value={loading ? "…" : money(stats.revenue)} hint="سفارشهای پرداخت شده" icon={MousePointerClick} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <Panel title="روند بازدید" description="۱۴ روز اخیر" className="xl:col-span-2">
          {loading ? <div className="h-64 animate-pulse rounded-lg bg-accent/40" /> : <VisitsChart data={chartData} />}
        </Panel>

        <Panel title="منابع ترافیک" description="سهم هر کانال از بازدیدها">
          <ul className="space-y-3">
            {sources.map((source) => (
              <li key={source.key} className="text-xs">
                <div className="flex items-center justify-between">
                  <span>{source.label}</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{percent(source.share, 0)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, source.share)}%` }} />
                </div>
              </li>
            ))}
            {!loading && sources.length === 0 && <li className="py-6 text-center text-xs text-muted-foreground">آماری ثبت نشده است.</li>}
          </ul>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title="پربازدیدترین محصولات" description="بر اساس تعداد بازدید صفحه محصول">
          <ul className="divide-y divide-border/50">
            {topProducts.map((product, index) => (
              <li key={product.id} className="flex items-center justify-between gap-3 py-2.5 text-xs first:pt-0 last:pb-0">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="w-4 shrink-0 text-[11px] text-muted-foreground tabular-nums">{faNumber(index + 1)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{product.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{product.category}</span>
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{faNumber(product.views)} بازدید</span>
              </li>
            ))}
            {!loading && topProducts.length === 0 && <li className="py-6 text-center text-xs text-muted-foreground">محصولی ثبت نشده است.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}