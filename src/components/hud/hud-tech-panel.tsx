import { useStore } from "@tanstack/react-store";
import type { ReactNode } from "react";
import { useId } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { appStore } from "@/stores/app-store";

interface TechPanelProps {
  title: string;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  color?: string;
  noPadding?: boolean;
}

export const HudTechPanel = ({
  title,
  children,
  align = "left",
  className,
  color = "cyan",
  noPadding = false,
}: TechPanelProps) => {
  const panelId = useId();
  const contentId = `${panelId}-content`;
  const activeId = useStore(appStore, (state) => state.activeTechPanelId);
  const isActive = activeId === panelId;
  const isMobile = useIsMobile();

  return (
    <div
      className={cn("pointer-events-auto relative", className)}
      data-slot="tech-panel"
    >
      <div
        className={cn(
          "pointer-events-auto mb-2 flex gap-2 md:flex-row",
          "flex-col md:items-center md:gap-2",
          align === "right"
            ? "items-end md:flex-row-reverse md:text-right"
            : "items-start"
        )}
      >
        <div className="size-2" style={{ backgroundColor: color }} />
        <button
          aria-controls={contentId}
          aria-expanded={isActive}
          className={cn(
            "pointer-events-auto cursor-pointer font-mono text-white text-xs uppercase tracking-widest md:[writing-mode:horizontal-tb]",
            "rotate-180 [writing-mode:vertical-rl] md:rotate-0"
          )}
          onClick={() =>
            appStore.setState((prev) => ({
              ...prev,
              activeTechPanelId: isActive ? null : panelId,
            }))
          }
          type="button"
        >
          {title}
        </button>
        {!isMobile && (
          <div className="relative h-px flex-1 bg-white/20">
            <div
              className={cn(
                "absolute top-0 h-0.75 w-1/3 bg-white/40",
                align === "right" ? "right-0" : "left-0"
              )}
            />
          </div>
        )}
      </div>

      {(!isMobile || isActive) && (
        <div
          className={cn(
            "relative overflow-hidden border border-white/10 bg-[#050505]/10 backdrop-blur-xs",
            "fixed top-[35%] left-1/2 z-50 w-[min(90vw,20rem)] -translate-x-1/2 -translate-y-1/2",
            "pointer-events-none translate-y-6 opacity-0 transition-all duration-300 ease-out",
            "md:pointer-events-auto md:relative md:top-auto md:left-auto md:z-auto md:w-auto md:translate-x-0 md:translate-y-0 md:opacity-100",
            isActive && "pointer-events-auto translate-y-0 opacity-100",
            noPadding ? "p-0" : "p-4"
          )}
          data-slot="tech-panel-body"
          id={contentId}
        >
          <div
            className={cn(
              "absolute top-0 size-2 bg-white/10",
              align === "right" ? "left-0" : "right-0"
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 size-2 bg-white/10",
              align === "right" ? "right-0" : "left-0"
            )}
          />
          <div
            className={cn(
              "absolute top-0 size-3 border-white/50 border-t",
              align === "right" ? "right-0 border-r" : "left-0 border-l"
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 size-3 border-white/50 border-b",
              align === "right" ? "left-0 border-l" : "right-0 border-r"
            )}
          />
          {children}
        </div>
      )}
    </div>
  );
};
