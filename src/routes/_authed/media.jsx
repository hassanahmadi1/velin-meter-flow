const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import { Image } from "@/components/ui/image";
import { fetchList } from "@/lib/db";
import { faNumber, faDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/media")({
  head: () => ({ meta: [{ title: "رسانهها | پنل مدیریت ولین" }] }),
  component: MediaPage,
});

function MediaPage() {
  const inputRef = useRef(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setAssets(await fetchList(db.entities.MediaAsset, {}, { limit: 200 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
        await db.entities.MediaAsset.create({
          title: file.name,
          file_url,
          file_type: file.type.startsWith("video") ? "video" : file.type.startsWith("image") ? "image" : "document",
          size_label: `${Math.max(1, Math.round(file.size / 1024))} کیلوبایت`,
          folder: "عمومی",
        });
      }
      toast.success("فایلها بارگذاری شدند");
      load();
    } catch (error) {
      toast.error(error?.message || "بارگذاری فایل ناموفق بود");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    try {
      await db.entities.MediaAsset.delete(removing.id);
      toast.success("فایل حذف شد");
      load();
    } catch (error) {
      toast.error(error?.message || "حذف فایل ناموفق بود");
    }
  }

  return (
    <>
      <PageHeader
        title="رسانهها"
        description="کتابخانه تصاویر فروشگاه؛ برای محصولات، بلاگ و بنرها."
        actions={
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
              بارگذاری فایل
            </button>
            <input ref={inputRef} type="file" accept="image/*,video/*,.pdf" multiple onChange={upload} className="hidden" />
          </>
        }
      />

      <p className="mb-3 text-[11px] text-muted-foreground">
        فایلها بهصورت عمومی ذخیره میشوند؛ هر کسی که لینک را داشته باشد میتواند آنها را باز کند.
      </p>

      <Panel>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square animate-pulse rounded-lg bg-accent/40" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="کتابخانه خالی است"
            description="اولین تصویر یا فایل فروشگاه را بارگذاری کنید."
            action={
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 px-3 text-xs hover:bg-accent"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                بارگذاری
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {assets.map((asset) => (
              <figure key={asset.id} className="group overflow-hidden rounded-lg border border-border/70 bg-background">
                <div className="relative aspect-square overflow-hidden bg-accent/40">
                  {asset.file_type === "image" ? (
                    <Image src={asset.file_url} alt={asset.title || "فایل رسانه"} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setRemoving(asset)}
                    aria-label={`حذف ${asset.title}`}
                    className="absolute end-2 top-2 rounded-md bg-background/85 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <figcaption className="px-2.5 py-2">
                  <p className="truncate text-[11px] font-medium">{asset.title || "بدون نام"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {asset.size_label || "—"} · {faDate(asset.created_date)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Panel>

      <p className="mt-3 text-[11px] text-muted-foreground">{faNumber(assets.length)} فایل در کتابخانه</p>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف فایل"
        description="این فایل از کتابخانه حذف میشود. اگر در محصولی استفاده شده، تصویر آن محصول نمایش داده نمیشود."
        onConfirm={remove}
      />
    </>
  );
}