const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LifeBuoy } from "lucide-react";

import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import TicketConversation from "@/components/tickets/TicketConversation";
import { fetchList } from "@/lib/db";
import { cn } from "@/lib/utils";
import { faNumber, faDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/tickets")({
  head: () => ({ meta: [{ title: "تیکتها | پنل مدیریت ولین" }] }),
  component: TicketsPage,
});

const FILTERS = [
  { value: "all", label: "همه" },
  { value: "open", label: "باز" },
  { value: "answered", label: "پاسخ داده شده" },
  { value: "closed", label: "بسته" },
];

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeId, setActiveId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetchList(db.entities.Ticket, {}, { limit: 100 });
    setTickets(rows);
    setActiveId((current) => current ?? rows[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => (filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter)), [tickets, filter]);
  const active = tickets.find((ticket) => ticket.id === activeId) ?? filtered[0];

  return (
    <>
      <PageHeader title="تیکتها" description="گفتگو با مشتریان؛ پاسخ به پرسشها و پیگیری سفارشها." />

      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const count = item.value === "all" ? tickets.length : tickets.filter((ticket) => ticket.status === item.value).length;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] transition-colors",
                filter === item.value
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {item.label}
              <span className="tabular-nums opacity-70">{faNumber(count)}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <Panel bodyClassName="p-0 sm:p-0" className="max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-16 animate-pulse rounded-lg bg-accent/40" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={LifeBuoy} title="تیکتی وجود ندارد" description="با تغییر فیلتر دوباره بررسی کنید." />
          ) : (
            <ul className="divide-y divide-border/50">
              {filtered.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(ticket.id)}
                    className={cn(
                      "w-full px-4 py-3 text-start transition-colors",
                      active?.id === ticket.id ? "bg-accent/60" : "hover:bg-accent/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-xs font-medium">{ticket.subject}</p>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {ticket.customer_name} · {faDateTime(ticket.updated_date || ticket.created_date)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel bodyClassName="p-0 sm:p-0" className="min-h-[420px] max-h-[640px] overflow-hidden">
          {active ? (
            <TicketConversation key={active.id} ticket={active} onUpdated={load} />
          ) : (
            <EmptyState icon={LifeBuoy} title="تیکتی انتخاب نشده" description="از فهرست کنار یکی از تیکتها را انتخاب کنید." />
          )}
        </Panel>
      </div>
    </>
  );
}