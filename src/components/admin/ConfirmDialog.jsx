import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "حذف", onConfirm }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border/70 bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">{title}</DialogTitle>
          {description && <DialogDescription className="text-xs leading-6 text-muted-foreground">{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="h-9 text-xs" onClick={() => onOpenChange(false)} disabled={busy}>
            انصراف
          </Button>
          <Button variant="destructive" className="h-9 text-xs" onClick={confirm} disabled={busy}>
            {busy && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}