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
  title: "",
  slug: "",
  category: "سبک زندگی",
  excerpt: "",
  content: "",
  cover_url: "",
  status: "draft",
  author: "تیم ولین",
};

export default function BlogFormDialog({ open, onOpenChange, post, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(post ? { ...EMPTY, ...post } : EMPTY);
  }, [open, post]);

  function change(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error("عنوان مقاله را وارد کنید");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || form.title.trim().replace(/\s+/g, "-"),
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        cover_url: form.cover_url,
        status: form.status,
        author: form.author,
        published_at: form.status === "published" ? new Date().toISOString().slice(0, 10) : form.published_at,
      };
      if (post?.id) await db.entities.BlogPost.update(post.id, payload);
      else await db.entities.BlogPost.create(payload);
      toast.success(post?.id ? "مقاله بهروزرسانی شد" : "مقاله ایجاد شد");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error?.message || "ذخیره مقاله ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto border-border/70 bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">{post?.id ? "ویرایش مقاله" : "مقاله جدید"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="عنوان" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => change("title", e.target.value)} placeholder="مثلاً راهنمای انتخاب جنس پارچه" className="h-10 text-xs" />
          </Field>
          <Field label="نشانی (slug)" hint="در آدرس مقاله استفاده میشود.">
            <Input value={form.slug} onChange={(e) => change("slug", e.target.value)} placeholder="fabric-guide" className="h-10 font-mono text-xs" dir="ltr" />
          </Field>
          <Field label="دستهبندی">
            <SelectInput
              value={form.category}
              onChange={(e) => change("category", e.target.value)}
              options={["سبک زندگی", "راهنمای خرید", "پشت صحنه", "اخبار"].map((value) => ({ value, label: value }))}
            />
          </Field>
          <Field label="نویسنده">
            <Input value={form.author} onChange={(e) => change("author", e.target.value)} className="h-10 text-xs" />
          </Field>
          <Field label="وضعیت">
            <SelectInput
              value={form.status}
              onChange={(e) => change("status", e.target.value)}
              options={[
                { value: "draft", label: "پیشنویس" },
                { value: "published", label: "منتشر شده" },
              ]}
            />
          </Field>
          <div className="sm:col-span-2">
            <ImageUpload value={form.cover_url} onChange={(url) => change("cover_url", url)} label="تصویر کاور" />
          </div>
          <Field label="خلاصه" className="sm:col-span-2">
            <Textarea value={form.excerpt} onChange={(e) => change("excerpt", e.target.value)} rows={2} className="text-xs" />
          </Field>
          <Field label="متن مقاله" className="sm:col-span-2">
            <Textarea value={form.content} onChange={(e) => change("content", e.target.value)} rows={7} className="text-xs leading-7" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" className="h-9 text-xs" onClick={() => onOpenChange(false)} disabled={busy}>
            انصراف
          </Button>
          <Button className="h-9 text-xs" onClick={save} disabled={busy}>
            {busy && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {post?.id ? "ذخیره تغییرات" : "ایجاد مقاله"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}