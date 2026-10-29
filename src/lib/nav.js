import {
  BookOpen,
  Clapperboard,
  History,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MessageSquare,
  MessagesSquare,
  Package,
  Settings,
  ShoppingBag,
  Wallet,
} from "lucide-react";

// Every destination of the admin panel, grouped the way the sidebar shows them.
export const NAV_GROUPS = [
  {
    title: "مرور کلی",
    items: [{ label: "داشبورد", to: "/", icon: LayoutDashboard }],
  },
  {
    title: "فروش",
    items: [
      { label: "محصولات", to: "/products", icon: Package },
      { label: "سفارشها", to: "/orders", icon: ShoppingBag },
    ],
  },
  {
    title: "محتوا",
    items: [
      { label: "رسانهها", to: "/media", icon: Clapperboard },
      { label: "بلاگ", to: "/blogs", icon: BookOpen },
      { label: "نظرات و پرسشها", to: "/comments", icon: MessagesSquare },
    ],
  },
  {
    title: "پشتیبانی",
    items: [
      { label: "تیکتها", to: "/tickets", icon: LifeBuoy },
      { label: "بازخوردها", to: "/feedback", icon: MessageSquare },
    ],
  },
  {
    title: "گزارشها",
    items: [
      { label: "تحلیل و بازدید", to: "/analytics", icon: LineChart },
      { label: "حسابداری و مالی", to: "/finance", icon: Wallet },
    ],
  },
  {
    title: "سیستم",
    items: [
      { label: "تنظیمات", to: "/settings", icon: Settings },
      { label: "گزارش تغییرات", to: "/changelog", icon: History },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function findNavItem(pathname) {
  const exact = ALL_NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact;
  return ALL_NAV_ITEMS.filter((item) => item.to !== "/").find((item) => pathname.startsWith(item.to));
}