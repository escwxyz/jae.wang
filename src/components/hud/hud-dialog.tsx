import type { ReactNode } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/animate-ui/components/base/dialog";
import { cn } from "@/lib/utils";

interface HudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function HudDialog({
  open,
  onOpenChange,
  title = "System Notice",
  description = "Awaiting operator input.",
  children,
  className,
  showCloseButton = false,
}: HudDialogProps) {
  const showHeader = Boolean(title || description);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup
        className={cn(
          "rounded-none border border-white/10 bg-[#050505]/85 p-0 text-white shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {showHeader && (
          <DialogHeader className="border-white/10 border-b px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <span className="size-1.5 bg-cyan-400" />
              {title && (
                <DialogTitle className="font-mono text-[10px] text-white/70 uppercase tracking-[0.4em]">
                  {title}
                </DialogTitle>
              )}
            </div>
            {description && (
              <DialogDescription className="mt-1 font-mono text-[9px] text-white/40">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="px-4 py-4">{children}</div>
      </DialogPopup>
    </Dialog>
  );
}
