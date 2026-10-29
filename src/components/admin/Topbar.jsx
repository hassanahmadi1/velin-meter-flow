import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu } from "lucide-react";
import { findNavItem } from "@/lib/nav";
import { faDate } from "@/lib/format";

export default function Topbar({ onOpenMenu, openTickets = 0 }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const current = findNavItem(pathname);
  const today = faDate(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="باز کردن منو"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0">
        <p className="truncate font-heading text-[15px] font-semibold">{current?.label ?? "پنل مدیریت"}</p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">{today}</p>
      </div>

      <div className="ms-auto flex items-center gap-2">
        <Link
          to="/tickets"
          aria-label="تیکتهای باز"
          className="relative rounded-lg border border-border/70 p-2 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          {openTickets > 0 && (
            <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {openTickets}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}