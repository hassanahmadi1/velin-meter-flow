const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { CheckCheck, Loader2, Send, User } from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { faDateTime } from "@/lib/format";

export default function TicketConversation({ ticket, onUpdated }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBody("");
  }, [ticket?.id]);

  if (!ticket) return null;

  async function send() {
    if (!body.trim()) return;
    setBusy(true);
    try {
      const messages = [
        ...(ticket.messages ?? []),
        { sender: "admin", body: body.trim(), at: new Date().toISOString() },
      ];
      await db.entities.Ticket.update(ticket.id, { messages, status: "answered" });
      setBody("");
      toast.success("پاسخ ارسال شد");
      onUpdated();
    } catch (error) {
      toast.error(error?.message || "ارسال پاسخ ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status) {
    setBusy(true);
    try {
      await db.entities.Ticket.update(ticket.id, { status });
      toast.success(status === "closed" ? "تیکت بسته شد" : "تیکت باز شد");
      onUpdated();
    } catch (error) {
      toast.error(error?.message || "تغییر وضعیت ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate font-heading text-sm font-semibold">{ticket.subject}</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {ticket.customer_name} · <span dir="ltr">{ticket.customer_phone}</span>
              {ticket.order_number ? ` · سفارش ${ticket.order_number}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {(ticket.messages ?? []).map((message, index) => {
          const isAdmin = message.sender === "admin";
          return (
            <div key={`${message.at}-${index}`} className={cn("flex gap-2", isAdmin ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-xl border px-3 py-2 text-xs leading-6",
                  isAdmin ? "border-primary/25 bg-primary/10 text-foreground" : "border-border/70 bg-accent/40",
                )}
              >
                <p className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  {isAdmin ? <CheckCheck className="h-3 w-3" aria-hidden="true" /> : <User className="h-3 w-3" aria-hidden="true" />}
                  {isAdmin ? "پشتیبانی" : ticket.customer_name}
                  <span>· {faDateTime(message.at)}</span>
                </p>
                <p className="whitespace-pre-line">{message.body}</p>
              </div>
            </div>
          );
        })}
        {(ticket.messages ?? []).length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">پیامی وجود ندارد.</p>}
      </div>

      <div className="space-y-2 border-t border-border/60 p-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="پاسخ خود را بنویسید…"
          className="text-xs"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            className="h-9 gap-1.5 border-border/70 text-xs"
            onClick={() => setStatus(ticket.status === "closed" ? "open" : "closed")}
            disabled={busy}
          >
            {ticket.status === "closed" ? "باز کردن تیکت" : "بستن تیکت"}
          </Button>
          <Button className="h-9 gap-2 text-xs" onClick={send} disabled={busy || !body.trim()}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
            ارسال پاسخ
          </Button>
        </div>
      </div>
    </div>
  );
}