import { cn } from "@/lib/utils";

export default function StatCard({ label, value, hint, icon: Icon, accent = false, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-border sm:p-5",
        accent && "border-primary/25 bg-gradient-to-bl from-primary/10 via-card to-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border",
              accent ? "border-primary/30 bg-primary/10 text-primary" : "border-border/70 bg-accent/50 text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}