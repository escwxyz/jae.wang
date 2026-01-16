import { motion } from "motion/react";
import { Suspense, useState } from "react";
import { TrajectoryMap } from "../trajectory-map";
import { HudDialog } from "./hud-dialog";
import { HudTechPanel } from "./hud-tech-panel";

export const HudTrajectoryModule = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <HudTechPanel align="right" title="Trajectory Map">
        <div className="relative w-full overflow-hidden border border-white/10">
          <button
            className="relative flex h-48 w-full flex-1 cursor-pointer items-center justify-center overflow-hidden"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,30,1)_0%,rgba(0,0,0,1)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[20px_20px]" />

            <motion.div
              animate={{ rotate: 360 }}
              className="absolute size-40 rounded-full border border-white/5"
              transition={{
                duration: 60,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              className="absolute size-30 rounded-full border border-white/10 border-dashed"
              transition={{
                duration: 40,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute size-20 rounded-full border border-white/20"
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />

            <div className="relative z-10 flex size-4 items-center justify-center rounded-full border border-white/20 bg-primary shadow-[0_0_50px_rgba(0,243,255,0.2)]">
              <div className="absolute inset-0 animate-ping rounded-full border border-neon-blue/30" />
            </div>

            <svg className="pointer-events-none absolute inset-0 h-full w-full scale-75 opacity-20">
              <title>Orbit Lines</title>
              <line
                stroke="white"
                strokeDasharray="4 4"
                x1="50%"
                x2="80%"
                y1="50%"
                y2="20%"
              />
              <circle cx="80%" cy="20%" fill="white" r="2" />
              <text
                fill="white"
                fontFamily="monospace"
                fontSize="10"
                x="81%"
                y="19%"
              >
                GARGANTUA
              </text>

              <line
                stroke="white"
                strokeDasharray="4 4"
                x1="50%"
                x2="20%"
                y1="50%"
                y2="70%"
              />
              <circle cx="20%" cy="70%" fill="white" r="2" />
              <text
                fill="white"
                fontFamily="monospace"
                fontSize="10"
                x="15%"
                y="73%"
              >
                MANN'S
              </text>
            </svg>
          </button>
        </div>
      </HudTechPanel>
      <HudDialog
        className="sm:max-w-3xl"
        description="INTERSTELLAR_VOYAGE_DATA"
        onOpenChange={() => setIsOpen((prev) => !prev)}
        open={isOpen}
        title="TRAJECTORY_MAP"
      >
        <Suspense>
          <div className="h-80 w-80 overflow-hidden sm:h-96 sm:w-[32rem] md:h-[26rem] md:w-[40rem]">
            <TrajectoryMap isOpen={isOpen} />
          </div>
        </Suspense>
      </HudDialog>
    </>
  );
};
