const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History } from "lucide-react";

import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchList } from "@/lib/db";
import { faDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/changelog")({
  head: () => ({ meta: [{ title: "گزارش تغییرات | پنل مدیریت ولین" }] }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchList(db.entities.ChangelogEntry, {}, { limit: 50 })
      .then((rows) => {
        if (active) setEntries(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeader title="گزارش تغییرات" description="تاریخچه قابلیتها و بهبودهای پنل مدیریت." />

      <Panel>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-lg bg-accent/40" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState icon={History} title="تغییری ثبت نشده" description="بهزودی قابلیتهای جدید همینجا فهرست میشوند." />
        ) : (
          <ol className="relative space-y-5 border-s border-border/60 ps-5">
            {entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -start-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{entry.version}</span>
                  <StatusBadge status={entry.type} />
                  <span className="text-[11px] text-muted-foreground">{faDate(entry.date || entry.created_date)}</span>
                </div>
                <h2 className="mt-1 font-heading text-sm font-semibold">{entry.title}</h2>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{entry.description}</p>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}