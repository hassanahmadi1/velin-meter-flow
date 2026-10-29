// Full-screen card shared by the auth pages; it sets its own color tokens so it stays readable under any theme.
export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-2xl font-bold text-primary">
            V
          </span>
          <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xs text-xs leading-6 text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6">{children}</div>
        {footer && <p className="mt-6 text-center text-xs text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}