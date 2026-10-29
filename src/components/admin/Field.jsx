import { cn } from "@/lib/utils";

// A labelled form row shared by the dialogs.
export default function Field({ label, hint, children, className }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}