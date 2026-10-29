import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/admin/StatusBadge";
import { faNumber, money, shortDate } from "@/lib/format";

export default function RecentOrders({ orders }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="text-[11px] text-muted-foreground">شماره</TableHead>
            <TableHead className="text-[11px] text-muted-foreground">مشتری</TableHead>
            <TableHead className="text-[11px] text-muted-foreground">تاریخ</TableHead>
            <TableHead className="text-[11px] text-muted-foreground">مبلغ</TableHead>
            <TableHead className="text-[11px] text-muted-foreground">وضعیت</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-border/50">
              <TableCell className="font-mono text-[11px] text-muted-foreground">{order.order_number}</TableCell>
              <TableCell className="text-xs">
                <span className="block font-medium">{order.customer_name}</span>
                <span className="block text-[11px] text-muted-foreground">{order.city}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">
                {shortDate(order.order_date || order.created_date)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs tabular-nums">{money(order.total)}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <Link to="/orders" aria-label="مشاهده سفارشها" className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                هنوز سفارشی ثبت نشده است.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-1 pt-3 text-[11px] text-muted-foreground">
        <span>نمایش آخرین {faNumber(orders.length)} سفارش</span>
        <Link to="/orders" className="font-medium text-primary hover:underline">
          همه سفارشها
        </Link>
      </div>
    </div>
  );
}