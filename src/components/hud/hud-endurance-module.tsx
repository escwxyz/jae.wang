import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { EnduranceShip } from "../endurance-ship";
import { HudDialog } from "./hud-dialog";
import { HudTechPanel } from "./hud-tech-panel";

const CORRUPTED_MODULE_INDEX = 8;

export const HudEnduranceModule = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <HudTechPanel color="#ffb347" title="Endurance">
        <div className="relative aspect-square w-full overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[20px_20px]" />
          <button
            className="cursor-pointer"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            <Suspense>
              <EnduranceShip
                className="transition-colors duration-200 hover:text-primary"
                isSpinning
              />
            </Suspense>
          </button>
          <div className="absolute top-3 left-3">
            <div className="font-mono text-[10px] text-primary">ENDURANCE</div>
            <div className="font-mono text-[8px] text-white/40">
              ORBITAL_STATION
            </div>
          </div>
          <div className="absolute right-3 bottom-3 text-right">
            <div className="font-mono text-[10px] text-white">5.3 RPM</div>
            <div className="font-mono text-[8px] text-white/40">SPIN_RATE</div>
          </div>
        </div>
      </HudTechPanel>
      <HudDialog
        description={""}
        onOpenChange={() => setIsOpen((prev) => !prev)}
        open={isOpen}
        title="Endurance_Status"
      >
        <div className="flex h-full flex-col gap-6" key="device">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/50 uppercase">
                    Ranger Dock 1
                  </span>
                  <span className="font-mono text-[10px] text-primary">
                    SECURE
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                  <div className="h-full w-full bg-primary/50" />
                </div>
              </div>

              <div className="border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/50 uppercase">
                    Ranger Dock 2
                  </span>
                  <span className="font-mono text-[10px] text-destructive">
                    EMPTY
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                  <div className="h-full w-full animate-pulse bg-destructive/50" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/50 uppercase">
                    Lander Dock 1
                  </span>
                  <span className="font-mono text-[10px] text-primary">
                    SECURE
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                  <div className="h-full w-full bg-primary/50" />
                </div>
              </div>
              <div className="border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/50 uppercase">
                    Lander Dock 2
                  </span>
                  <span className="font-mono text-[10px] text-destructive">
                    EMPTY
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                  <div className="h-full w-full animate-pulse bg-destructive/50" />
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/5 p-3">
              <h4 className="mb-3 font-mono text-[10px] text-white/50 uppercase">
                Module Integrity
              </h4>
              <div className="grid grid-cols-6 gap-1">
                {[...new Array(12)].map((_, i) => (
                  <div
                    className={cn(
                      "flex h-6 items-center justify-center border border-white/10 font-mono text-[6px]",
                      i === CORRUPTED_MODULE_INDEX - 1
                        ? "border-red-500/50 bg-red-500/20 text-red-500"
                        : "bg-white/5 text-white/40"
                    )}
                    // biome-ignore lint/suspicious/noArrayIndexKey: <ignore>
                    key={i}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto border border-white/10 border-dashed bg-white/5 p-3">
            <p className="font-mono text-[9px] text-white/60 leading-relaxed">
              <span className="text-destructive">ALERT:</span> Micrometeoroid
              impact detected on Module {CORRUPTED_MODULE_INDEX}. Integrity
              compromised. Repair bots deployed.
            </p>
          </div>
        </div>
      </HudDialog>
    </>
  );
};
