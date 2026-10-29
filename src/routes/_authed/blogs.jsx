const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import BlogFormDialog from "@/components/blogs/BlogFormDialog";
import { Image } from "@/components/ui/image";
import { fetchList } from "@/lib/db";
import { faDate, faNumber } from "@/lib/format";

export const Route = createFileRoute("/_authed/blogs")({
  head: () => ({ meta: [{ title: "بلاگ | پنل مدیریت ولین" }] }),
  component: BlogsPage,
});

function BlogsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setPosts(await fetchList(db.entities.BlogPost, {}, { limit: 100 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove() {
    try {
      await db.entities.BlogPost.delete(removing.id);
      toast.success("مقاله حذف شد");
      load();
    } catch (error) {
      toast.error(error?.message || "حذف مقاله ناموفق بود");
    }
  }

  return (
    <>
      <PageHeader
        title="بلاگ"
        description="مقالات مجله ولین؛ از راهنمای خرید تا پشت صحنهی تولید."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            مقاله جدید
          </button>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-xl bg-accent/40" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Panel>
          <EmptyState icon={BookOpen} title="مقالهای وجود ندارد" description="اولین مقاله مجله را بنویسید." />
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-xl border border-border/70 bg-card">
              <div className="relative aspect-[16/9] overflow-hidden bg-accent/40">
                {post.cover_url ? (
                  <Image src={post.cover_url} alt={post.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </div>
                )}
                <span className="absolute end-2 top-2">
                  <StatusBadge status={post.status} />
                </span>
              </div>
              <div className="p-3.5">
                <p className="text-[10px] text-muted-foreground">{post.category || "بدون دسته"}</p>
                <h2 className="mt-1 line-clamp-2 font-heading text-sm font-semibold leading-6">{post.title}</h2>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{post.excerpt}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                  <span className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{faDate(post.published_at || post.created_date)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" aria-hidden="true" />
                      {faNumber(post.views)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(post);
                        setFormOpen(true);
                      }}
                      aria-label={`ویرایش ${post.title}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoving(post)}
                      aria-label={`حذف ${post.title}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <BlogFormDialog open={formOpen} onOpenChange={setFormOpen} post={editing} onSaved={load} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف مقاله"
        description={`«${removing?.title ?? ""}» حذف میشود. این عمل قابل بازگشت نیست.`}
        onConfirm={remove}
      />
    </>
  );
}