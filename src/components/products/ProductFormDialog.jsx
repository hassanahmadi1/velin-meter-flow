const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Field from "@/components/admin/Field";
import ImageUpload from "@/components/admin/ImageUpload";
import SelectInput from "@/components/admin/SelectInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPTY = {
  name: "",
  sku: "",
  category: "پوشاک",
  price: 0,
  compare_price: 0,
  stock: 0,
  status: "active",
  image_url: "",
  description: "",
};

export default function ProductFormDialog({ open, onOpenChange, product, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(product ? { ...EMPTY, ...product } : EMPTY);
  }, [open, product]);

  function change(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("نام محصول را وارد کنید");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        compare_price: Number(form.compare_price) || 0,
        stock: Number(form.stock) || 0,
        status: form.status,
        image_url: form.image_url,
        description: form.description,
      };
      if (product?.id) await db.entities.Product.update(product.id, payload);
      else await db.entities.Product.create(payload);
      toast.success(product?.id ? "محصول بهروزرسانی شد" : "محصول ایجاد شد");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error?.message || "ذخیره محصول ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto border-border/70 bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">{product?.id ? "ویرایش محصول" : "محصول جدید"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام محصول" className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => change("name", e.target.value)} placeholder="مثلاً تیشرت نخی کرِم" className="h-10 text-xs" />
          </Field>
          <Field label="کد محصول (SKU)">
            <Input value={form.sku} onChange={(e) => change("sku", e.target.value)} placeholder="VLN-1001" className="h-10 font-mono text-xs" dir="ltr" />
          </Field>
          <Field label="دستهبندی">
            <SelectInput
              value={form.category}
              onChange={(e) => change("category", e.target.value)}
              options={["پوشاک", "کیف و کفش", "اکسسوری"].map((value) => ({ value, label: value }))}
            />
          </Field>
          <Field label="قیمت (تومان)">
            <Input type="number" min="0" value={form.price} onChange={(e) => change("price", e.target.value)} className="h-10 text-xs" dir="ltr" />
          </Field>
          <Field label="قیمت پیش از تخفیف" hint="خالی یا صفر بگذارید اگر تخفیف ندارد.">
            <Input type="number" min="0" value={form.compare_price} onChange={(e) => change("compare_price", e.target.value)} className="h-10 text-xs" dir="ltr" />
          </Field>
          <Field label="موجودی">
            <Input type="number" min="0" value={form.stock} onChange={(e) => change("stock", e.target.value)} className="h-10 text-xs" dir="ltr" />
          </Field>
          <Field label="وضعیت">
            <SelectInput
              value={form.status}
              onChange={(e) => change("status", e.target.value)}
              options={[
                { value: "active", label: "فعال" },
                { value: "draft", label: "پیشنویس" },
                { value: "archived", label: "بایگانی" },
              ]}
            />
          </Field>
          <div className="sm:col-span-2">
            <ImageUpload value={form.image_url} onChange={(url) => change("image_url", url)} label="تصویر محصول" />
          </div>
          <Field label="توضیحات" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => change("description", e.target.value)} rows={3} className="text-xs" placeholder="جنس، اندازهها و نکات محصول" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" className="h-9 text-xs" onClick={() => onOpenChange(false)} disabled={busy}>
            انصراف
          </Button>
          <Button className="h-9 text-xs" onClick={save} disabled={busy}>
            {busy && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {product?.id ? "ذخیره تغییرات" : "ایجاد محصول"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}