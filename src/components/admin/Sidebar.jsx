import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, X } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

function Brand({ onNavigate }) {
  return (
    <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-xl font-bold text-primary">
        V
      </span>
      <span className="min-w-0">
        <span className="block truncate font-heading text-base font-semibold leading-tight">ولین</span>
        <span className="block text-[11px] text-muted-foreground">پنل مدیریت فروشگاه</span>
      </span>
    </Link>
  );
}

function NavList({ pathname, onNavigate }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            {group.title}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(`${item.to}/`));
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground/80")}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                    {active && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UserBlock() {
  const { user, logout } = useAuth();
  const initial = (user?.full_name || user?.email || "م").trim().charAt(0);

  return (
    <div className="border-t border-border/60 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">{user?.full_name || "مدیر فروشگاه"}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{user?.email || "—"}</span>
        </span>
        <button
          type="button"
          onClick={logout}
          title="خروج از حساب"
          aria-label="خروج از حساب"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function SidebarNav({ pathname, onNavigate, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Brand onNavigate={onNavigate} />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="me-3 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <NavList pathname={pathname} onNavigate={onNavigate} />
      <UserBlock />
    </>
  );
}

export default function Sidebar({ pathname }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-border/60 bg-sidebar lg:flex">
      <div className="sticky top-0 flex h-svh flex-col">
        <SidebarNav pathname={pathname} />
      </div>
    </aside>
  );
}