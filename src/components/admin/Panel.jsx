import { cn } from "@/lib/utils";

export default function Panel({ title, description, action, children, className, bodyClassName }) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-border/70 bg-card", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="font-heading text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}