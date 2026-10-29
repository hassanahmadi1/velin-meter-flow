import { cn } from "@/lib/utils";

// A native select wearing the panel's input styling.
export default function SelectInput({ value, onChange, options, className, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn(
        "h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-popover text-foreground">
          {option.label}
        </option>
      ))}
    </select>
  );
}