const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import Sidebar, { SidebarNav } from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

// The frame of every signed-in page: sidebar, top bar and the page itself.
export default function AdminShell({ children }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    let active = true;
    db.entities.Ticket.filter({ status: "open" })
      .then((items) => {
        if (active) setOpenTickets(items.length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar pathname={pathname} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="flex w-72 flex-col border-border/60 bg-sidebar p-0">
          <SidebarNav pathname={pathname} onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} openTickets={openTickets} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}