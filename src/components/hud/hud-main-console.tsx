import {
  Logout01Icon,
  NewsIcon,
  Route03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Suspense, useState } from "react";
import { appStore } from "@/stores/app-store";
import { LazarusLogo } from "../lazarus-logo";
import { CommandGroup, CommandItem } from "../ui/command";
import { HudCommandDialog } from "./hud-command-dialog";

export const HudMainConsole = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative flex h-32 w-48 items-center justify-center border-white/10 border-x bg-black/40 backdrop-blur-sm">
        <div className="absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-amber-500/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-amber-500/50 to-transparent" />
        <button
          className="cursor-pointer"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <LazarusLogo
            className="h-full w-full opacity-80 transition-colors duration-200 hover:fill-primary"
            showText={true}
          />
        </button>
        <div className="pointer-events-none absolute inset-0 bg-amber-500/5 mix-blend-overlay" />
      </div>
      <HudCommandDialog
        onOpenChange={() => setIsOpen((prev) => !prev)}
        open={isOpen}
      >
        <Suspense>
          <CommandGroup heading="Operation List">
            <CommandItem>
              <HugeiconsIcon icon={Logout01Icon} />
              <button
                onClick={() =>
                  appStore.setState((prev) => ({
                    ...prev,
                    isHudIdle: !prev.isHudIdle,
                  }))
                }
                type="button"
              >
                Exit
              </button>
            </CommandItem>
            <CommandItem>
              <HugeiconsIcon icon={Route03Icon} />
              <button
                onClick={() =>
                  appStore.setState((prev) => ({
                    ...prev,
                    activeTechPanelId: "todo",
                  }))
                }
                type="button"
              >
                Trajectory Map
              </button>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem>
              <HugeiconsIcon icon={NewsIcon} />
              Posts
            </CommandItem>
          </CommandGroup>
        </Suspense>
      </HudCommandDialog>
    </>
  );
};
