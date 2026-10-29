const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCheck, MessageSquare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchList } from "@/lib/db";
import { cn } from "@/lib/utils";
import { faDateTime, percent } from "@/lib/format";

export const Route = createFileRoute("/_authed/feedback")({
  head: () => ({ meta: [{ title: "بازخوردها | پنل مدیریت ولین" }] }),
  component: FeedbackPage,
});

const FILTERS = [
  { value: "all", label: "همه" },
  { value: "new", label: "جدید" },
  { value: "read", label: "خوانده شده" },
  { value: "resolved", label: "بررسی شده" },
];

function FeedbackPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await fetchList(db.entities.Feedback, {}, { limit: 200 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => (filter === "all" ? items : items.filter((item) => item.status === filter)), [items, filter]);
  const average = items.length ? items.reduce((total, item) => total + (item.rating || 0), 0) / items.length : 0;

  async function setStatus(item, status) {
    try {
      await db.entities.Feedback.update(item.id, { status });
      toast.success("وضعیت بازخورد بهروزرسانی شد");
      load();
    } catch (error) {
      toast.error(error?.message || "تغییر وضعیت ناموفق بود");
    }
  }

  async function remove() {
    try {
      await db.entities.Feedback.delete(removing.id);
      toast.success("بازخورد حذف شد");
      load();
    } catch (error) {
      toast.error(error?.message || "حذف بازخورد ناموفق بود");
    }
  }

  return (
    <>
      <PageHeader
        title="بازخوردها"
        description={`نظرات کلی مشتریان درباره تجربه خرید. میانگین امتیاز ${percent((average / 5) * 100, 0)}`}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "h-8 rounded-full border px-3 text-[11px] transition-colors",
              filter === item.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-xl bg-accent/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Panel>
          <EmptyState icon={MessageSquare} title="بازخوردی یافت نشد" description="با تغییر فیلتر دوباره بررسی کنید." />
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="flex flex-col rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium">{item.name || "مشتری"}</p>
                  <p className="text-[11px] text-muted-foreground">{item.contact || "—"}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <span className="mt-3 flex items-center gap-0.5" aria-label={`امتیاز ${item.rating} از ۵`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn("h-3 w-3", star <= (item.rating || 0) ? "fill-primary text-primary" : "text-muted-foreground/40")}
                    aria-hidden="true"
                  />
                ))}
              </span>

              <p className="mt-2 flex-1 text-xs leading-6 text-foreground/90">{item.message}</p>

              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                <span className="text-[10px] text-muted-foreground">{faDateTime(item.created_date)}</span>
                <span className="flex items-center gap-1">
                  {item.status !== "resolved" && (
                    <button
                      type="button"
                      onClick={() => setStatus(item, "resolved")}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border/70 px-2 text-[10px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      <CheckCheck className="h-3 w-3" aria-hidden="true" />
                      بررسی شد
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRemoving(item)}
                    aria-label="حذف بازخورد"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف بازخورد"
        description="این بازخورد برای همیشه حذف میشود."
        onConfirm={remove}
      />
    </>
  );
}