const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { MapPin, Phone, Receipt, Truck } from "lucide-react";
import { toast } from "sonner";

import Field from "@/components/admin/Field";
import SelectInput from "@/components/admin/SelectInput";
import StatusBadge from "@/components/admin/StatusBadge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { faDate, faDateTime, faNumber, money } from "@/lib/format";

const STATUSES = [
  { value: "pending", label: "در انتظار پرداخت" },
  { value: "paid", label: "پرداخت شده" },
  { value: "processing", label: "در حال آمادهسازی" },
  { value: "shipped", label: "ارسال شده" },
  { value: "delivered", label: "تحویل شده" },
  { value: "canceled", label: "لغو شده" },
];

export default function OrderDetailSheet({ order, open, onOpenChange, onUpdated }) {
  const [status, setStatus] = useState(order?.status ?? "pending");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(order?.status ?? "pending");
  }, [order]);

  if (!order) return null;

  const items = order.items ?? [];
  const itemsTotal = items.reduce((total, item) => total + (item.quantity || 0) * (item.unit_price || 0), 0);

  async function changeStatus(next) {
    setStatus(next);
    setBusy(true);
    try {
      await db.entities.Order.update(order.id, { status: next });
      toast.success("وضعیت سفارش بهروزرسانی شد");
      onUpdated();
    } catch (error) {
      toast.error(error?.message || "تغییر وضعیت ناموفق بود");
      setStatus(order.status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto border-border/60 bg-card sm:max-w-md">
        <SheetHeader className="text-start">
          <SheetTitle className="font-heading text-base">سفارش {order.order_number}</SheetTitle>
          <SheetDescription className="text-[11px] text-muted-foreground">
            ثبت شده در {faDateTime(order.created_date)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-[11px] text-muted-foreground">وضعیت سفارش</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={status} />
              <SelectInput value={status} onChange={(e) => changeStatus(e.target.value)} options={STATUSES} disabled={busy} className="h-9 flex-1" />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium">{order.customer_name}</span>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground" dir="ltr">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {order.customer_phone || "—"}
            </p>
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {order.city ? `${order.city}، ` : ""}
                {order.address || "آدرسی ثبت نشده"}
              </span>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" />
              {order.payment_method === "cod" ? "پرداخت در محل" : "پرداخت آنلاین"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium">اقلام سفارش</p>
            <ul className="divide-y divide-border/50 rounded-lg border border-border/70">
              {items.map((item, index) => (
                <li key={`${item.product_name}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
                  <span className="min-w-0">
                    <span className="block truncate">{item.product_name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {faNumber(item.quantity)} × {money(item.unit_price)}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">{money((item.quantity || 0) * (item.unit_price || 0))}</span>
                </li>
              ))}
              {items.length === 0 && <li className="px-3 py-4 text-center text-[11px] text-muted-foreground">قلمی ثبت نشده است.</li>}
            </ul>
          </div>

          <dl className="space-y-2 rounded-lg bg-accent/40 p-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">جمع اقلام</dt>
              <dd className="tabular-nums">{money(itemsTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-border/50 pt-2 font-medium">
              <dt>مبلغ کل</dt>
              <dd className="tabular-nums text-primary">{money(order.total)}</dd>
            </div>
          </dl>

          {order.note && (
            <div>
              <p className="mb-1 text-xs font-medium">یادداشت مشتری</p>
              <p className="rounded-lg border border-border/70 p-3 text-[11px] leading-6 text-muted-foreground">{order.note}</p>
            </div>
          )}

          <Field label="تاریخ سفارش">
            <p className="rounded-lg border border-border/70 px-3 py-2 text-xs">{faDate(order.order_date || order.created_date)}</p>
          </Field>
        </div>
      </SheetContent>
    </Sheet>
  );
}