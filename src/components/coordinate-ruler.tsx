import { type MotionValue, motion, useTransform } from "motion/react";

interface CoordinateRulerProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  z: MotionValue<number>;
}

export const CoordinateRuler = ({ x, y, z }: CoordinateRulerProps) => {
  const rulerSpeed = 5.2;
  const dashOffsetX = useTransform(x, (latest) => -latest * rulerSpeed);
  const dashOffsetY = useTransform(y, (latest) => -latest * rulerSpeed);
  const dashOffsetZ = useTransform(z, (latest) => -latest * rulerSpeed);

  const rulers = [
    { id: "x", label: "X", dashOffset: dashOffsetX },
    { id: "y", label: "Y", dashOffset: dashOffsetY },
    { id: "z", label: "Z", dashOffset: dashOffsetZ },
  ] as const;

  return (
    <>
      {rulers.map((ruler) => (
        <div
          className="flex items-center gap-2"
          data-slot="coordinate-ruler-row"
          key={ruler.id}
        >
          <span className="font-mono text-[10px] text-white/45 tracking-[0.35em]">
            {ruler.label}
          </span>
          <div
            className="flex flex-col items-start"
            data-slot="coordinate-ruler-line"
          >
            <svg className="h-3 w-25" viewBox="0 0 100 12">
              <title>{ruler.label}</title>
              <path
                d="M10 6 H90"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <motion.path
                d="M10 6 H90"
                fill="none"
                stroke="white"
                strokeDasharray="1 10"
                strokeWidth="4"
                style={{ strokeDashoffset: ruler.dashOffset }}
              />
            </svg>
            {ruler.id === "z" ? (
              <svg className="mt-1 h-1 w-25" viewBox="0 0 100 8">
                <title>Axis indicator</title>
                <path d="M50 0 L44 8 L56 8 Z" fill="white" />
              </svg>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
};
