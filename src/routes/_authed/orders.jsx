const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge, { STATUS_META } from "@/components/admin/StatusBadge";
import OrderDetailSheet from "@/components/orders/OrderDetailSheet";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchList, sumBy } from "@/lib/db";
import { cn } from "@/lib/utils";
import { faNumber, money, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/orders")({
  head: () => ({ meta: [{ title: "سفارشها | پنل مدیریت ولین" }] }),
  component: OrdersPage,
});

const FILTERS = ["all", "pending", "paid", "processing", "shipped", "delivered", "canceled"];

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setOrders(await fetchList(db.entities.Order, {}, { limit: 200 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === "all" || order.status === filter;
      const matchesTerm =
        !term ||
        order.order_number?.toLowerCase().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_phone?.includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [orders, search, filter]);

  const revenue = sumBy(filtered.filter((order) => order.status !== "canceled" && order.status !== "pending"), (order) => order.total);

  return (
    <>
      <PageHeader title="سفارشها" description="پیگیری سفارشها، تغییر وضعیت ارسال و مشاهده جزئیات هر خرید." />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((value) => {
          const count = value === "all" ? orders.length : orders.filter((order) => order.status === value).length;
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {value === "all" ? "همه" : STATUS_META[value]?.label}
              <span className="tabular-nums opacity-70">{faNumber(count)}</span>
            </button>
          );
        })}
      </div>

      <Panel bodyClassName="p-0 sm:p-0">
        <div className="flex flex-col gap-2 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی شماره سفارش، نام یا موبایل…"
              className="h-10 border-border/70 ps-10 text-xs"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            مجموع مبلغ سفارشهای نمایش داده شده: <span className="font-medium text-foreground">{money(revenue)}</span>
          </p>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="h-14 animate-pulse rounded-lg bg-accent/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="سفارشی یافت نشد" description="فیلتر یا عبارت جستجو را تغییر دهید." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-[11px] text-muted-foreground">شماره</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">مشتری</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">تاریخ</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">اقلام</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">مبلغ</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">وضعیت</TableHead>
                  <TableHead className="w-16 text-[11px] text-muted-foreground">جزئیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="border-border/50">
                    <TableCell className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">{order.order_number}</TableCell>
                    <TableCell className="text-xs">
                      <span className="block font-medium">{order.customer_name}</span>
                      <span className="block text-[11px] text-muted-foreground" dir="ltr">
                        {order.customer_phone}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">
                      {shortDate(order.order_date || order.created_date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">
                      {faNumber(order.items?.length || 0)} قلم
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs tabular-nums">{money(order.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setSelected(order)}
                        className="rounded-md border border-border/70 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                      >
                        مشاهده
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <OrderDetailSheet order={selected} open={!!selected} onOpenChange={(open) => !open && setSelected(null)} onUpdated={load} />
    </>
  );
}