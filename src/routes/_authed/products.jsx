const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import SelectInput from "@/components/admin/SelectInput";
import StatusBadge from "@/components/admin/StatusBadge";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image } from "@/components/ui/image";
import { fetchList } from "@/lib/db";
import { faNumber, money } from "@/lib/format";

export const Route = createFileRoute("/_authed/products")({
  head: () => ({ meta: [{ title: "محصولات | پنل مدیریت ولین" }] }),
  component: ProductsPage,
});

const STATUS_OPTIONS = [
  { value: "all", label: "همه وضعیتها" },
  { value: "active", label: "فعال" },
  { value: "draft", label: "پیشنویس" },
  { value: "archived", label: "بایگانی" },
];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setProducts(await fetchList(db.entities.Product, {}, { limit: 200 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesStatus = status === "all" || product.status === status;
      const matchesTerm =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [products, search, status]);

  async function remove() {
    try {
      await db.entities.Product.delete(removing.id);
      toast.success("محصول حذف شد");
      load();
    } catch (error) {
      toast.error(error?.message || "حذف محصول ناموفق بود");
    }
  }

  return (
    <>
      <PageHeader
        title="محصولات"
        description="مدیریت کاتالوگ فروشگاه؛ قیمت، موجودی و وضعیت نمایش هر محصول."
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
            محصول جدید
          </button>
        }
      />

      <Panel bodyClassName="p-0 sm:p-0">
        <div className="flex flex-col gap-2 border-b border-border/60 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس نام، کد یا دستهبندی…"
              className="h-10 border-border/70 ps-10 text-xs"
            />
          </div>
          <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} className="sm:w-44" />
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">{faNumber(filtered.length)} محصول</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-14 animate-pulse rounded-lg bg-accent/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="محصولی یافت نشد" description="با تغییر جستجو یا افزودن محصول جدید شروع کنید." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-[11px] text-muted-foreground">محصول</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">دسته</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">قیمت</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">موجودی</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">بازدید</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">وضعیت</TableHead>
                  <TableHead className="w-24 text-[11px] text-muted-foreground">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id} className="border-border/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-accent/40">
                          {product.image_url && (
                            <Image src={product.image_url} alt={product.name} fittingType="fill" className="h-full w-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{product.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{product.sku || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">{product.category || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs tabular-nums">{money(product.price)}</TableCell>
                    <TableCell className="text-xs tabular-nums">
                      <span className={product.stock <= 5 ? "text-amber-300" : ""}>{faNumber(product.stock)}</span>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">{faNumber(product.views)}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(product);
                            setFormOpen(true);
                          }}
                          aria-label={`ویرایش ${product.name}`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoving(product)}
                          aria-label={`حذف ${product.name}`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} onSaved={load} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف محصول"
        description={`«${removing?.name ?? ""}» برای همیشه حذف میشود. این عمل قابل بازگشت نیست.`}
        onConfirm={remove}
      />
    </>
  );
}