/** biome-ignore-all lint/suspicious/noArrayIndexKey: <ignore> */
import { motion } from "motion/react";
import type React from "react";

import { cn } from "@/lib/utils";

interface EnduranceShipProps {
  className?: string;
  color?: string;
  isSpinning?: boolean;
  corruptedModuleIndex?: number;
}

const OUTER_RING_RADIUS = 24;
const INNER_RING_RADIUS = 12;
const MODULE_WIDTH = 90;
const MODULE_HEIGHT = 150;
const WINDOW_SIZE = 18;
const CORNER_ACCENT = 14;
const AIRLOCK_RING_OUTER = OUTER_RING_RADIUS;
const AIRLOCK_BODY_WIDTH = OUTER_RING_RADIUS * 2; // match tunnel outer diameter
const AIRLOCK_BODY_HEIGHT = OUTER_RING_RADIUS * 2; // match tunnel outer diameter
const AIRLOCK_NECK_HEIGHT = 12;
const AIRLOCK_NOZZLE_WIDTH = OUTER_RING_RADIUS * 0.9;
const AIRLOCK_NOZZLE_HEIGHT = 12;
const CRYO_WIDTH = 80;
const CRYO_HEIGHT = 140;
const CRYO_CHAMFER = 12;
const DOCK_WIDTH = 50;
const DOCK_HEIGHT = 100;
const DOCK_CORNER = 12;
const DOCK_PORT_WIDTH = 34;
const DOCK_PORT_HEIGHT = 14;
const DOCK_GAP = 12;
const DOCK_LINK_SPACING = DOCK_HEIGHT + DOCK_PORT_HEIGHT * 2 + DOCK_GAP;

const ORIGIN_RING_OUTER = 32;
const ORIGIN_RING_INNER = 14;
const LANDER_VIEWBOX_WIDTH = 484;
const LANDER_TARGET_WIDTH = 260;
const LANDER_SCALE = LANDER_TARGET_WIDTH / LANDER_VIEWBOX_WIDTH;
const LANDER_STROKE = 1;
const RANGER_VIEWBOX_WIDTH = 32;
const RANGER_TARGET_WIDTH = 70;
const RANGER_SCALE = RANGER_TARGET_WIDTH / RANGER_VIEWBOX_WIDTH;
const RANGER_STROKE = 0.8;

const MODULE_MAPS = [
  "cryo-lab",
  "landing-pod",
  "main-engine",
  "command-module",
  "main-engine",
  "landing-pod",
  "cryo-lab",
  "landing-pod",
  "main-engine",
  "cryo-lab",
  "main-engine",
  "landing-pod",
];

const CONNECTION_MAPS = [
  "tunnel",
  "tunnel",
  "airlock",
  "tunnel",
  "airlock",
  "tunnel",
  "tunnel",
  "tunnel",
  "airlock",
  "tunnel",
  "airlock",
  "tunnel",
];

function CommunicatingTunnel() {
  return (
    <g data-slot="communicating-tunnel">
      {/* Outer ring */}
      <circle
        fill="none"
        r={OUTER_RING_RADIUS}
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Inner ring */}
      <circle
        fill="none"
        r={INNER_RING_RADIUS}
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* Small clamp/plate on top of the ring */}
      <rect
        fill="none"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        width="22"
        x={-11}
        y={-OUTER_RING_RADIUS - 10}
      />

      {/* Connection lines: two per side at 15° from horizontal, symmetric offsets */}
      {[
        { angle: 15, offset: 12 }, // right, upper
        { angle: 15, offset: -12 }, // right, lower
        { angle: 180 - 15, offset: 12 }, // left, upper
        { angle: 180 - 15, offset: -12 }, // left, lower
      ].map(({ angle, offset }, idx) => {
        const rad = (angle * Math.PI) / 180;
        const perp = rad + Math.PI / 2;
        const dx = Math.cos(perp) * offset;
        const dy = Math.sin(perp) * offset;
        const x1 = OUTER_RING_RADIUS * Math.cos(rad) + dx;
        const y1 = OUTER_RING_RADIUS * Math.sin(rad) + dy;
        const x2 = (OUTER_RING_RADIUS + 40) * Math.cos(rad) + dx;
        const y2 = (OUTER_RING_RADIUS + 40) * Math.sin(rad) + dy;
        return (
          <line
            key={idx}
            stroke="currentColor"
            strokeWidth="2"
            x1={x1}
            x2={x2}
            y1={-y1}
            y2={-y2}
          />
        );
      })}
    </g>
  );
}

function OriginMarker() {
  return (
    <g data-slot="origin-marker">
      <circle
        fill="none"
        r={ORIGIN_RING_OUTER}
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        fill="none"
        r={ORIGIN_RING_INNER}
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="0" cy="0" fill="currentColor" r="2" />
    </g>
  );
}

function ChamferedPanel({
  width,
  height,
  chamfer,
  strokeWidth = 2,
}: {
  width: number;
  height: number;
  chamfer: number;
  strokeWidth?: number;
}) {
  const hw = width / 2;
  const hh = height / 2;
  const points = [
    [-hw + chamfer, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
    [-hw, -hh + chamfer],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
  return (
    <polygon
      fill="none"
      points={points}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  );
}

function CryoLabModule() {
  const hw = CRYO_WIDTH / 2;
  const hh = CRYO_HEIGHT / 2;

  return (
    <g data-slot="cryo-lab-module">
      <ChamferedPanel
        chamfer={CRYO_CHAMFER}
        height={CRYO_HEIGHT}
        strokeWidth={2}
        width={CRYO_WIDTH}
      />

      {/* Top-left grid of squares */}
      {[
        [-hw + 12, -hh + 12],
        [-hw + 22, -hh + 12],
        [-hw + 12, -hh + 22],
        [-hw + 22, -hh + 22],
      ].map(([x, y], idx) => (
        <rect
          fill="none"
          height={6}
          key={idx}
          stroke="currentColor"
          strokeWidth="1.5"
          width={6}
          x={x}
          y={y}
        />
      ))}

      {/* Top-right column dots */}
      {[0, 12].map((dy, idx) => (
        <rect
          fill="none"
          height={6}
          key={`dot-${idx}`}
          stroke="currentColor"
          strokeWidth="1.5"
          width={6}
          x={hw - 18}
          y={-hh + 12 + dy}
        />
      ))}

      {/* Tall slots */}
      {[-hw + 12, -8, 12].map((x, idx) => (
        <rect
          fill="none"
          height={idx === 0 ? hh - 10 : hh}
          key={`slot-${idx}`}
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          width={16}
          x={x}
          y={-hh + 36}
        />
      ))}

      {/* Bottom-left inset */}
      <rect
        fill="none"
        height={32}
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        width={14}
        x={-hw + 12}
        y={hh - 40}
      />
    </g>
  );
}

function LandingPodModule() {
  const hw = CRYO_WIDTH / 2;
  const hh = CRYO_HEIGHT / 2;

  return (
    <g data-slot="landing-pod-module">
      <ChamferedPanel
        chamfer={CRYO_CHAMFER}
        height={CRYO_HEIGHT}
        strokeWidth={2}
        width={CRYO_WIDTH}
      />

      {/* Top-left grid of squares */}
      {[
        [-hw + 12, -hh + 12],
        [-hw + 22, -hh + 12],
        [-hw + 12, -hh + 22],
        [-hw + 22, -hh + 22],
      ].map(([x, y], idx) => (
        <rect
          fill="none"
          height={6}
          key={idx}
          stroke="currentColor"
          strokeWidth="1.5"
          width={6}
          x={x}
          y={y}
        />
      ))}

      {/* Top-right column dots */}
      {[0, 12].map((dy, idx) => (
        <rect
          fill="none"
          height={6}
          key={`lp-dot-${idx}`}
          stroke="currentColor"
          strokeWidth="1.5"
          width={6}
          x={hw - 18}
          y={-hh + 12 + dy}
        />
      ))}

      {/* Two tall slots */}
      {[-12, 12].map((x, idx) => (
        <rect
          fill="none"
          height={hh}
          key={`lp-slot-${idx}`}
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          width={18}
          x={x}
          y={-hh + 32}
        />
      ))}

      {/* Bottom band */}
      <rect
        fill="none"
        height={10}
        stroke="currentColor"
        strokeWidth="1.6"
        width={CRYO_WIDTH - 10}
        x={-hw + 5}
        y={hh - 16}
      />
    </g>
  );
}

function CommandModule() {
  const hw = CRYO_WIDTH / 2;
  const hh = CRYO_HEIGHT / 2;

  return (
    <g data-slot="command-module">
      <ChamferedPanel
        chamfer={CRYO_CHAMFER}
        height={CRYO_HEIGHT}
        strokeWidth={2}
        width={CRYO_WIDTH}
      />

      {/* Top-left grid of squares */}
      {[
        [-hw + 12, -hh + 12],
        [-hw + 22, -hh + 12],
        [-hw + 12, -hh + 22],
        [-hw + 22, -hh + 22],
      ].map(([x, y], idx) => (
        <rect
          fill="none"
          height={6}
          key={`cmd-grid-${idx}`}
          stroke="currentColor"
          strokeWidth="1.5"
          width={6}
          x={x}
          y={y}
        />
      ))}

      {/* Top-right small column */}
      <rect
        fill="none"
        height={12}
        stroke="currentColor"
        strokeWidth="1.5"
        width={6}
        x={hw - 18}
        y={-hh + 12}
      />

      {/* Left tall bay */}
      <rect
        fill="none"
        height={hh + 10}
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width={16}
        x={-hw + 12}
        y={-hh + 32}
      />

      {/* Two central tall bays */}
      {[-6, 14].map((x, idx) => (
        <rect
          fill="none"
          height={hh + 6}
          key={`cmd-tall-${idx}`}
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
          width={18}
          x={x}
          y={-hh + 32}
        />
      ))}
    </g>
  );
}

function DockingHub({ half }: { half?: boolean }) {
  const width = half ? DOCK_WIDTH : DOCK_WIDTH;
  const height = half ? DOCK_WIDTH : DOCK_HEIGHT;
  const corner = half ? DOCK_CORNER / 2 : DOCK_CORNER;
  const halfW = width / 2;
  const halfH = height / 2;

  return (
    <g data-slot="docking-hub">
      {/* Main capsule */}
      <rect
        fill="none"
        height={height}
        rx={corner}
        stroke="currentColor"
        strokeWidth="2"
        width={width}
        x={-halfW}
        y={-halfH}
      />

      {/* Top port */}
      <rect
        fill="none"
        height={DOCK_PORT_HEIGHT}
        stroke="currentColor"
        strokeWidth="2"
        width={DOCK_PORT_WIDTH}
        x={-DOCK_PORT_WIDTH / 2}
        y={-halfH - DOCK_PORT_HEIGHT}
      />
      {/* Bottom port */}
      <rect
        fill="none"
        height={DOCK_PORT_HEIGHT}
        stroke="currentColor"
        strokeWidth="2"
        width={DOCK_PORT_WIDTH}
        x={-DOCK_PORT_WIDTH / 2}
        y={halfH}
      />
    </g>
  );
}

function LanderModule() {
  const outlinePath =
    "M -93 -73 L -241 -25 L -226 69 L -202 94 H -158 L -132 83 L -96 41 L -46 0 H 46 L 96 41 L 132 83 L 158 94 H 202 L 226 69 L 241 -25 L 93 -73 L 77 -50 H 31 V -61 H -31 V -50 H -77 Z M -226 69 L -163 58 L -96 41 L -46 0 H 46 L 96 41 L 163 58 L 226 69 M 237 0 H 167 L 77 -33 H -77 L -167 0 H -237 M -167 0 L -163 58 M 167 0 L 163 58 M -123 -16 L -96 41 M 123 -16 L 96 41";

  return (
    <g data-slot="lander-module" transform={`scale(${LANDER_SCALE})`}>
      <path
        d={outlinePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={LANDER_STROKE}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function RangerModule() {
  const path = `
  M 9 0 L 11 -2 L 13 -1 L 16 -3 L 10 -11 L 7 -12 L -7 -12 L -10 -11 L -16 -3 L -13 -1 L -11 -2 L -9 0 L 9 0 M -6 -4 L 6 -4 M -11 -2 L -6 -4 M 11 -2 L 6 -4 M -12 -4 L -11 -8 C -11 -8 -7 -11 0 -11 C 8 -11 11 -8 11 -8 L 12 -4 M -6 -4 L -12 -4 L -14 -4 L -16 -3 M 6 -4 L 12 -4 L 14 -4 L 16 -3 M -3 -12 L -3 -13 C -3 -15 3 -15 3 -13 L 3 -12 M 1 -7 L 2 -5 L 8 -5 L 7 -8 L 2 -10 L 1 -7 M -9 0 L -7 -2 L 7 -2 L 9 0 M -1 -7 L -2 -10 L -7 -8 L -8 -5 L -2 -5 L -1 -7 M 2 -9 L 2 -9`;

  return (
    <g data-slot="ranger-module" transform={`scale(${RANGER_SCALE})`}>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={RANGER_STROKE}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function RingAirlock() {
  return (
    <g data-slot="ring-airlock">
      {/* Head ring */}
      <CommunicatingTunnel />
      {/* Upper neck */}
      <rect
        fill="none"
        height={10}
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        width={22}
        x={-10}
        y={AIRLOCK_RING_OUTER}
      />

      {/* Main capsule body */}
      <rect
        fill="none"
        height={AIRLOCK_BODY_HEIGHT}
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        width={AIRLOCK_BODY_WIDTH}
        x={-AIRLOCK_BODY_WIDTH / 2}
        y={AIRLOCK_RING_OUTER + 10}
      />

      {/* Lower neck */}
      <rect
        fill="none"
        height={AIRLOCK_NECK_HEIGHT}
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width={AIRLOCK_BODY_WIDTH - 18}
        x={-(AIRLOCK_BODY_WIDTH - 18) / 2}
        y={AIRLOCK_RING_OUTER + AIRLOCK_NECK_HEIGHT + AIRLOCK_BODY_HEIGHT}
      />

      {/* Nozzle */}
      <rect
        fill="none"
        height={AIRLOCK_NOZZLE_HEIGHT}
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        width={AIRLOCK_NOZZLE_WIDTH}
        x={-AIRLOCK_NOZZLE_WIDTH / 2}
        y={
          AIRLOCK_RING_OUTER +
          AIRLOCK_NECK_HEIGHT +
          AIRLOCK_BODY_HEIGHT +
          AIRLOCK_NECK_HEIGHT
        }
      />
    </g>
  );
}

function MainEngineModule() {
  const halfW = MODULE_WIDTH / 2;
  const halfH = MODULE_HEIGHT / 2;

  const windowW = WINDOW_SIZE * 1.6;
  const windowH = WINDOW_SIZE * 1.1;

  return (
    <g data-slot="main-engine-module">
      {/* Outer shell */}
      <rect
        fill="none"
        height={MODULE_HEIGHT}
        stroke="currentColor"
        strokeWidth="3"
        width={MODULE_WIDTH}
        x={-halfW}
        y={-halfH}
      />

      {/* Corner accents (top-left and top-right) */}
      <line
        stroke="currentColor"
        strokeWidth="3"
        x1={-halfW + CORNER_ACCENT}
        x2={-halfW}
        y1={-halfH}
        y2={-halfH + CORNER_ACCENT}
      />
      <line
        stroke="currentColor"
        strokeWidth="3"
        x1={halfW - CORNER_ACCENT}
        x2={halfW}
        y1={-halfH}
        y2={-halfH + CORNER_ACCENT}
      />

      {/* Small recessed rectangle */}
      <rect
        fill="none"
        height={windowH}
        stroke="currentColor"
        strokeWidth="2.5"
        width={windowW}
        x={-windowW / 2 + 10}
        y={-windowH * 2}
      />
    </g>
  );
}

export const EnduranceShip: React.FC<EnduranceShipProps> = ({
  className,
  color = "currentColor",
  isSpinning = false,
  corruptedModuleIndex = 8, // 1 - 12 for ring modules, starting at 3 o'clock and going clockwise
}) => {
  // Map incoming corrupted index (1-12, starting at 3 o'clock clockwise) to internal ring index
  const corruptedInternalIndex =
    corruptedModuleIndex != null ? (9 + (corruptedModuleIndex - 1)) % 12 : null;

  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center",
        className
      )}
      data-slot="endurance-ship"
    >
      <motion.svg
        animate={isSpinning ? { rotate: 540 } : { rotate: 180 }}
        className="h-full w-full"
        initial={{ rotate: 180 }}
        style={{
          color,
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        transition={{
          duration: 11.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        viewBox="-520 -520 1040 1040"
      >
        <title>Click to view details</title>

        <OriginMarker />
        {/* Docking hubs aligned vertically through the origin */}
        <g
          transform={`translate(0, -${DOCK_LINK_SPACING / 2 - 10}) scale(0.7)`}
        >
          <DockingHub half />
        </g>
        <g transform={`translate(0, ${DOCK_LINK_SPACING / 2 - 10}) scale(0.7)`}>
          <DockingHub half />
        </g>

        {/* Center anchors: origin is midpoint between rangers */}
        <g transform="translate(-50, 0) rotate(-90) scale(2.0)">
          <RangerModule />
        </g>
        {/* <g transform="translate(50, 0) rotate(90) scale(2.0)">
          <RangerModule />
        </g> */}
        <g transform="translate(0, -90) scale(0.4)">
          <LanderModule />
        </g>
        <g transform="translate(0, 90) scale(0.6)">
          <circle
            className="animate-pulse text-destructive"
            fill="none"
            r={60}
            stroke="currentColor"
            strokeDasharray="6 6"
            strokeWidth="4"
          />
        </g>

        {/* Ring starting below the origin with CryoLab (6 o'clock) */}
        {(() => {
          const ringRadius = 360;
          const moduleLookup: Record<string, React.FC> = {
            "cryo-lab": CryoLabModule,
            "landing-pod": LandingPodModule,
            "main-engine": MainEngineModule,
            "command-module": CommandModule,
          };
          const modules = MODULE_MAPS.map(
            (key) => moduleLookup[key] ?? CryoLabModule
          );
          const mirroredIndices = new Set([5, 6, 7, 9]); // 7, 6, 5, 3 o'clock slots

          return modules.map((Mod, idx) => {
            const angle = 90 + idx * 30;
            const rad = (angle * Math.PI) / 180;
            const x = ringRadius * Math.cos(rad);
            const y = ringRadius * Math.sin(rad);
            const mirror = mirroredIndices.has(idx) ? " scale(-1,1)" : "";
            const isCorrupted = corruptedInternalIndex === idx;
            const content = (
              <g
                className={cn(
                  isCorrupted ? "animate-pulse text-destructive" : "" // not working
                )}
                data-corrupted={isCorrupted ? "true" : undefined}
                key={`ring-${idx}`}
                transform={`translate(${x}, ${y}) rotate(${angle - 90})${mirror}`}
              >
                {isCorrupted ? (
                  <circle
                    fill="none"
                    r={110}
                    stroke="currentColor"
                    strokeDasharray="6 6"
                    strokeWidth="4"
                  />
                ) : null}
                <Mod />
              </g>
            );

            // Attach docking hub above index 9 (3 o'clock)
            if (idx === 9) {
              const hubOffset = -OUTER_RING_RADIUS * 4.8;
              return (
                <g key={`ring-${idx}-with-hub`}>
                  {content}
                  <g
                    transform={`translate(${x + hubOffset}, ${y}) scale(0.7) rotate(90)`}
                  >
                    <DockingHub />
                  </g>
                  <g
                    transform={`translate(${x + hubOffset - DOCK_HEIGHT + DOCK_GAP}, ${y}) scale(0.7) rotate(90)`}
                  >
                    <DockingHub />
                  </g>
                  <g
                    transform={`translate(${x + hubOffset - 2 * DOCK_HEIGHT + 2 * DOCK_GAP}, ${y}) scale(0.7) rotate(90)`}
                  >
                    <DockingHub />
                  </g>
                  <g
                    transform={`translate(${x + hubOffset - 4 * DOCK_HEIGHT + 7 * DOCK_GAP}, ${y}) scale(0.7) rotate(90)`}
                  >
                    <DockingHub />
                  </g>
                </g>
              );
            }

            return content;
          });
        })()}

        {/* Connection ring (slightly larger radius) */}
        {(() => {
          const ringRadius = 350;
          const connectionLookup: Record<string, React.FC> = {
            tunnel: CommunicatingTunnel,
            airlock: RingAirlock,
          };
          return CONNECTION_MAPS.map((key, idx) => {
            const Conn = connectionLookup[key] ?? CommunicatingTunnel;
            const angle = 105 + idx * 30; // 15° clockwise offset from 6->7 start
            const rad = (angle * Math.PI) / 180;
            const x = ringRadius * Math.cos(rad);
            const y = ringRadius * Math.sin(rad);
            return (
              <g
                key={`conn-${idx}`}
                transform={`translate(${x}, ${y}) rotate(${angle - 90}) scale(0.7)`}
              >
                <Conn />
              </g>
            );
          });
        })()}
      </motion.svg>
    </div>
  );
};
