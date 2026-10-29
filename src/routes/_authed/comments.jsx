const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, MessagesSquare, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchList } from "@/lib/db";
import { cn } from "@/lib/utils";
import { faNumber, faDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/comments")({
  head: () => ({ meta: [{ title: "نظرات و پرسشها | پنل مدیریت ولین" }] }),
  component: CommentsPage,
});

const TYPE_FILTERS = [
  { value: "all", label: "همه" },
  { value: "comment", label: "نظر" },
  { value: "question", label: "پرسش" },
];

const STATUS_FILTERS = [
  { value: "all", label: "همه وضعیتها" },
  { value: "pending", label: "در انتظار تایید" },
  { value: "approved", label: "تایید شده" },
  { value: "rejected", label: "رد شده" },
];

function Stars({ rating = 0 }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn("h-3 w-3", star <= rating ? "fill-primary text-primary" : "text-muted-foreground/40")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setComments(await fetchList(db.entities.Comment, {}, { limit: 200 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      comments.filter((comment) => {
        const matchesType = type === "all" || comment.type === type;
        const matchesStatus = status === "all" || comment.status === status;
        return matchesType && matchesStatus;
      }),
    [comments, type, status],
  );

  async function setCommentStatus(comment, next) {
    try {
      await db.entities.Comment.update(comment.id, { status: next });
      toast.success(next === "approved" ? "نظر تایید شد" : "نظر رد شد");
      load();
    } catch (error) {
      toast.error(error?.message || "تغییر وضعیت ناموفق بود");
    }
  }

  async function remove() {
    try {
      await db.entities.Comment.delete(removing.id);
      toast.success("نظر حذف شد");
      load();
    } catch (error) {
      toast.error(error?.message || "حذف نظر ناموفق بود");
    }
  }

  const pendingCount = comments.filter((comment) => comment.status === "pending").length;

  return (
    <>
      <PageHeader
        title="نظرات و پرسشها"
        description={`نظرات مشتریان روی محصولات. ${faNumber(pendingCount)} مورد در انتظار تایید است.`}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setType(item.value)}
            className={cn(
              "h-8 rounded-full border px-3 text-[11px] transition-colors",
              type === item.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={cn(
              "h-8 rounded-full border px-3 text-[11px] transition-colors",
              status === item.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Panel bodyClassName="p-0 sm:p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-20 animate-pulse rounded-lg bg-accent/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessagesSquare} title="نظری یافت نشد" description="با تغییر فیلترها دوباره بررسی کنید." />
        ) : (
          <ul className="divide-y divide-border/50">
            {filtered.map((comment) => (
              <li key={comment.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">
                      {comment.author_name}
                      <span className="ms-2 rounded border border-border/70 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                        {comment.type === "question" ? "پرسش" : "نظر"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {comment.product_name || "بدون محصول"} · {faDateTime(comment.created_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {comment.type !== "question" && <Stars rating={comment.rating} />}
                    <StatusBadge status={comment.status} />
                  </div>
                </div>
                <p className="mt-2.5 rounded-lg bg-accent/30 p-3 text-xs leading-6">{comment.body}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  {comment.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => setCommentStatus(comment, "approved")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 text-[11px] text-emerald-300 transition-colors hover:bg-emerald-500/15"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      تایید
                    </button>
                  )}
                  {comment.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => setCommentStatus(comment, "rejected")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 px-2.5 text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                      رد
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRemoving(comment)}
                    className="ms-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف نظر"
        description="این نظر برای همیشه حذف میشود."
        onConfirm={remove}
      />
    </>
  );
}