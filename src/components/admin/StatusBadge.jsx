import { cn } from "@/lib/utils";

const TONES = {
  accent: "border-primary/30 bg-primary/10 text-primary",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  neutral: "border-border/70 bg-accent/50 text-muted-foreground",
};

export const STATUS_META = {
  // سفارشها
  pending: { label: "در انتظار پرداخت", tone: "warning" },
  paid: { label: "پرداخت شده", tone: "info" },
  processing: { label: "در حال آمادهسازی", tone: "accent" },
  shipped: { label: "ارسال شده", tone: "info" },
  delivered: { label: "تحویل شده", tone: "success" },
  canceled: { label: "لغو شده", tone: "danger" },
  // محصولات
  active: { label: "فعال", tone: "success" },
  draft: { label: "پیشنویس", tone: "neutral" },
  archived: { label: "بایگانی", tone: "neutral" },
  // تیکتها
  open: { label: "باز", tone: "warning" },
  answered: { label: "پاسخ داده شده", tone: "info" },
  closed: { label: "بسته", tone: "neutral" },
  // نظرات
  approved: { label: "تایید شده", tone: "success" },
  rejected: { label: "رد شده", tone: "danger" },
  // بازخوردها
  new: { label: "جدید", tone: "accent" },
  read: { label: "خوانده شده", tone: "info" },
  resolved: { label: "بررسی شده", tone: "success" },
  // اولویت
  low: { label: "کم", tone: "neutral" },
  normal: { label: "معمولی", tone: "info" },
  high: { label: "فوری", tone: "danger" },
  // مالی
  income: { label: "درآمد", tone: "success" },
  expense: { label: "هزینه", tone: "danger" },
  // بلاگ
  published: { label: "منتشر شده", tone: "success" },
  // گزارش تغییرات
  feature: { label: "قابلیت جدید", tone: "accent" },
  improvement: { label: "بهبود", tone: "info" },
  fix: { label: "رفع اشکال", tone: "warning" },
};

export default function StatusBadge({ status, label, className }) {
  const meta = STATUS_META[status] ?? { label: status || "—", tone: "neutral" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONES[meta.tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? meta.label}
    </span>
  );
}