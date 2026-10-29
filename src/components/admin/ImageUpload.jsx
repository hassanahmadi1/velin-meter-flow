const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

// Uploads a picture for products, blog covers and the media library.
// Files are stored publicly — anyone with the link can open them.
export default function ImageUpload({ value, onChange, label = "تصویر", className }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function pick(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } catch (error) {
      toast.error(error?.message || "بارگذاری تصویر ناموفق بود");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-accent/40">
          {value ? (
            <Image src={value} alt="پیشنمایش تصویر" fittingType="fill" className="h-full w-full" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 px-3 text-xs font-medium transition-colors hover:border-border hover:bg-accent disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {busy ? "در حال بارگذاری…" : "انتخاب تصویر"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              حذف
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} className="hidden" />
    </div>
  );
}