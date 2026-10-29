const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import TransactionDialog from "@/components/finance/TransactionDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchList, sumBy } from "@/lib/db";
import { cn } from "@/lib/utils";
import { faDate, faNumber, money } from "@/lib/format";

export const Route = createFileRoute("/_authed/finance")({
  head: () => ({ meta: [{ title: "حسابداری و مالی | پنل مدیریت ولین" }] }),
  component: FinancePage,
});

const METHODS = { gateway: "درگاه پرداخت", card: "کارت به کارت", cash: "نقدی", transfer: "حواله بانکی" };

function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setTransactions(await fetchList(db.entities.Transaction, {}, { limit: 200 }));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const income = sumBy(transactions.filter((item) => item.type === "income"), (item) => item.amount);
  const expense = sumBy(transactions.filter((item) => item.type === "expense"), (item) => item.amount);

  const filtered = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((item) => item.type === filter)),
    [transactions, filter],
  );

  async function remove() {
    try {
      await db.entities.Transaction.delete(removing.id);
      toast.success("تراکنش حذف شد");
      load();
    } catch (error) {
      toast.error(error?.message || "حذف تراکنش ناموفق بود");
    }
  }

  return (
    <>
      <PageHeader
        title="حسابداری و مالی"
        description="درآمدها، هزینهها و مانده حساب فروشگاه."
        actions={
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            تراکنش جدید
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="مجموع درآمد" value={loading ? "…" : money(income)} hint="تراکنشهای ورودی" icon={ArrowDownLeft} accent />
        <StatCard label="مجموع هزینه" value={loading ? "…" : money(expense)} hint="تراکنشهای خروجی" icon={ArrowUpRight} />
        <StatCard label="مانده حساب" value={loading ? "…" : money(income - expense)} hint="درآمد منهای هزینه" icon={Wallet} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { value: "all", label: "همه تراکنشها" },
          { value: "income", label: "درآمد" },
          { value: "expense", label: "هزینه" },
        ].map((item) => (
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

      <Panel className="mt-3" bodyClassName="p-0 sm:p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-12 animate-pulse rounded-lg bg-accent/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Wallet} title="تراکنشی ثبت نشده" description="اولین تراکنش مالی را ثبت کنید." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-[11px] text-muted-foreground">عنوان</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">نوع</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">دسته</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">روش</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">تاریخ</TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">مبلغ</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="border-border/50">
                    <TableCell className="text-xs">
                      <span className="block font-medium">{item.title}</span>
                      {item.reference && <span className="block font-mono text-[10px] text-muted-foreground">{item.reference}</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.type} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">{item.category || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">{METHODS[item.method] ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">{faDate(item.date || item.created_date)}</TableCell>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap text-xs tabular-nums",
                        item.type === "income" ? "text-emerald-300" : "text-rose-300",
                      )}
                    >
                      {money(item.amount)}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setRemoving(item)}
                        aria-label={`حذف ${item.title}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <p className="mt-3 text-[11px] text-muted-foreground">{faNumber(filtered.length)} تراکنش</p>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف تراکنش"
        description="این تراکنش از دفتر مالی حذف میشود."
        onConfirm={remove}
      />
    </>
  );
}