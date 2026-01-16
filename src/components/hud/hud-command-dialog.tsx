import type { ReactNode } from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface HudCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disableInput?: boolean;
  title?: string;
  description?: string;
  inputPlaceholder?: string;
  children?: ReactNode;
  className?: string;
  listClassName?: string;
  showCloseButton?: boolean;
}

export function HudCommandDialog({
  open,
  onOpenChange,
  title = "Command Interface",
  description = "Select an action to continue.",
  inputPlaceholder = "Type a command...",
  children,
  className,
  listClassName,
  showCloseButton = false,
  disableInput = false,
}: HudCommandDialogProps) {
  return (
    <CommandDialog
      className={cn(
        "overflow-hidden border border-white/10 bg-[#050505]/80 p-0 text-white shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
        className
      )}
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton={showCloseButton}
      title={title}
    >
      <Command className="bg-transparent text-white" data-slot="hud-command">
        <div
          className="border-white/10 border-b px-4 py-3"
          data-slot="hud-command-header"
        >
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-cyan-400" />
            <span className="font-mono text-[10px] text-white/70 uppercase tracking-[0.4em]">
              {title}
            </span>
          </div>
          {description && (
            <p className="mt-1 font-mono text-[9px] text-white/40">
              {description}
            </p>
          )}
        </div>
        {!disableInput && (
          <CommandInput
            className="text-white placeholder:text-white/40"
            placeholder={inputPlaceholder}
          />
        )}
        <CommandList className={cn("max-h-[50vh] px-2 py-2", listClassName)}>
          {children}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
