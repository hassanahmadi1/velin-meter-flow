const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import Field from "@/components/admin/Field";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fetchList } from "@/lib/db";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "تنظیمات | پنل مدیریت ولین" }] }),
  component: SettingsPage,
});

const DEFAULTS = {
  store_name: "ولین",
  support_phone: "",
  email: "",
  address: "",
  instagram: "",
  shipping_fee: 0,
  free_shipping_threshold: 0,
  tax_percent: 9,
  low_stock_threshold: 5,
  notify_orders: true,
  notify_tickets: true,
  notify_reviews: false,
};

function SettingsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetchList(db.entities.StoreSetting, {}, { limit: 1 });
    if (rows[0]) {
      setForm({ ...DEFAULTS, ...rows[0] });
      setRecordId(rows[0].id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function change(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload = {
        store_name: form.store_name,
        support_phone: form.support_phone,
        email: form.email,
        address: form.address,
        instagram: form.instagram,
        shipping_fee: Number(form.shipping_fee) || 0,
        free_shipping_threshold: Number(form.free_shipping_threshold) || 0,
        tax_percent: Number(form.tax_percent) || 0,
        low_stock_threshold: Number(form.low_stock_threshold) || 0,
        notify_orders: form.notify_orders,
        notify_tickets: form.notify_tickets,
        notify_reviews: form.notify_reviews,
      };
      if (recordId) await db.entities.StoreSetting.update(recordId, payload);
      else {
        const created = await db.entities.StoreSetting.create(payload);
        setRecordId(created.id);
      }
      toast.success("تنظیمات ذخیره شد");
    } catch (error) {
      toast.error(error?.message || "ذخیره تنظیمات ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="تنظیمات" description="اطلاعات فروشگاه، ارسال و اعلانها." />
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-xl bg-accent/40" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="تنظیمات"
        description="اطلاعات فروشگاه، هزینه ارسال و اعلانها."
        actions={
          <Button className="h-9 gap-2 text-xs" onClick={save} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
            ذخیره تغییرات
          </Button>
        }
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <Panel title="اطلاعات فروشگاه" description="این اطلاعات در فاکتورها و تماس با مشتری استفاده میشود.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام فروشگاه" className="sm:col-span-2">
              <Input value={form.store_name} onChange={(e) => change("store_name", e.target.value)} className="h-10 text-xs" />
            </Field>
            <Field label="تلفن پشتیبانی">
              <Input value={form.support_phone} onChange={(e) => change("support_phone", e.target.value)} placeholder="۰۲۱-۱۲۳۴۵۶۷۸" className="h-10 text-xs" dir="ltr" />
            </Field>
            <Field label="ایمیل">
              <Input type="email" value={form.email} onChange={(e) => change("email", e.target.value)} placeholder="hello@velin.ir" className="h-10 text-xs" dir="ltr" />
            </Field>
            <Field label="اینستاگرام">
              <Input value={form.instagram} onChange={(e) => change("instagram", e.target.value)} placeholder="@velin" className="h-10 text-xs" dir="ltr" />
            </Field>
            <Field label="نشانی">
              <Input value={form.address} onChange={(e) => change("address", e.target.value)} placeholder="تهران، …" className="h-10 text-xs" />
            </Field>
          </div>
        </Panel>

        <Panel title="ارسال و پرداخت" description="هزینه ارسال و مالیات روی سفارشها اعمال میشود.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="هزینه ارسال (تومان)">
              <Input type="number" min="0" value={form.shipping_fee} onChange={(e) => change("shipping_fee", e.target.value)} className="h-10 text-xs" dir="ltr" />
            </Field>
            <Field label="ارسال رایگان از (تومان)">
              <Input type="number" min="0" value={form.free_shipping_threshold} onChange={(e) => change("free_shipping_threshold", e.target.value)} className="h-10 text-xs" dir="ltr" />
            </Field>
            <Field label="درصد مالیات">
              <Input type="number" min="0" value={form.tax_percent} onChange={(e) => change("tax_percent", e.target.value)} className="h-10 text-xs" dir="ltr" />
            </Field>
            <Field label="آستانه هشدار موجودی">
              <Input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => change("low_stock_threshold", e.target.value)} className="h-10 text-xs" dir="ltr" />
            </Field>
          </div>
        </Panel>

        <Panel title="اعلانها" description="دریافت خبر برای رویدادهای فروشگاه." className="xl:col-span-2">
          <div className="space-y-1">
            {[
              { key: "notify_orders", label: "سفارش جدید", hint: "برای هر سفارش تازه خبر بده" },
              { key: "notify_tickets", label: "تیکت جدید", hint: "وقتی مشتری پیام تازهای میفرستد" },
              { key: "notify_reviews", label: "نظر جدید", hint: "وقتی نظر یا پرسشی ثبت میشود" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 border-b border-border/40 py-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.hint}</p>
                </div>
                <Switch checked={!!form[item.key]} onCheckedChange={(checked) => change(item.key, checked)} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}