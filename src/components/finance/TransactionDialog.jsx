const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Field from "@/components/admin/Field";
import SelectInput from "@/components/admin/SelectInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/format";

const EMPTY = {
  title: "",
  type: "income",
  amount: 0,
  category: "فروش",
  method: "gateway",
  date: "",
  reference: "",
  note: "",
};

export default function TransactionDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...EMPTY, date: todayISO() });
  }, [open]);

  function change(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.title.trim() || !Number(form.amount)) {
      toast.error("عنوان و مبلغ را وارد کنید");
      return;
    }
    setBusy(true);
    try {
      await db.entities.Transaction.create({
        title: form.title.trim(),
        type: form.type,
        amount: Number(form.amount) || 0,
        category: form.category,
        method: form.method,
        date: form.date || todayISO(),
        reference: form.reference,
        note: form.note,
      });
      toast.success("تراکنش ثبت شد");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error?.message || "ثبت تراکنش ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border/70 bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">تراکنش جدید</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="عنوان" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => change("title", e.target.value)} placeholder="مثلاً تسویه با درگاه پرداخت" className="h-10 text-xs" />
          </Field>
          <Field label="نوع">
            <SelectInput
              value={form.type}
              onChange={(e) => change("type", e.target.value)}
              options={[
                { value: "income", label: "درآمد" },
                { value: "expense", label: "هزینه" },
              ]}
            />
          </Field>
          <Field label="مبلغ (تومان)">
            <Input type="number" min="0" value={form.amount} onChange={(e) => change("amount", e.target.value)} className="h-10 text-xs" dir="ltr" />
          </Field>
          <Field label="دستهبندی">
            <Input value={form.category} onChange={(e) => change("category", e.target.value)} className="h-10 text-xs" />
          </Field>
          <Field label="روش">
            <SelectInput
              value={form.method}
              onChange={(e) => change("method", e.target.value)}
              options={[
                { value: "gateway", label: "درگاه پرداخت" },
                { value: "card", label: "کارت به کارت" },
                { value: "cash", label: "نقدی" },
                { value: "transfer", label: "حواله بانکی" },
              ]}
            />
          </Field>
          <Field label="تاریخ">
            <Input type="date" value={form.date} onChange={(e) => change("date", e.target.value)} className="h-10 text-xs" dir="ltr" />
          </Field>
          <Field label="شماره پیگیری">
            <Input value={form.reference} onChange={(e) => change("reference", e.target.value)} className="h-10 font-mono text-xs" dir="ltr" />
          </Field>
          <Field label="یادداشت" className="sm:col-span-2">
            <Textarea value={form.note} onChange={(e) => change("note", e.target.value)} rows={2} className="text-xs" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" className="h-9 text-xs" onClick={() => onOpenChange(false)} disabled={busy}>
            انصراف
          </Button>
          <Button className="h-9 text-xs" onClick={save} disabled={busy}>
            {busy && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            ثبت تراکنش
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}