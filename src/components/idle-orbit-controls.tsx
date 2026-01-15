import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
// biome-ignore lint/performance/noNamespaceImport: <ignore>
import * as React from "react";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const IDLE_AZIMUTH_AMPLITUDE = Math.PI / 10;
const IDLE_POLAR_AMPLITUDE = Math.PI / 12;
const IDLE_POLAR_BASE = Math.PI / 2;
const IDLE_TARGET_RADIUS = 0.6;
const IDLE_TARGET_Y_AMPLITUDE = 0.2;
const IDLE_TRANSITION_DURATION = 1.2;

type IdleOrbitControlsProps = React.ComponentProps<typeof OrbitControls> & {
  initialIdleSpeed?: number;
  isIdle?: boolean;
};

export function IdleOrbitControls({
  initialIdleSpeed = 0.12,
  isIdle = true,
  ...props
}: IdleOrbitControlsProps) {
  const [idleSpeed, setIdleSpeed] = React.useState(initialIdleSpeed);
  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);
  const idleTimeRef = React.useRef(0);
  const prevIsIdleRef = React.useRef(isIdle);
  const transitionRef = React.useRef<{
    elapsed: number;
    startAzimuth: number;
    startPolar: number;
    startTarget: Vector3;
  } | null>(null);
  const idleTargetRef = React.useRef(new Vector3());
  const blendTargetRef = React.useRef(new Vector3());

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIdleSpeed((prev) => -prev);
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    if (isIdle && !prevIsIdleRef.current) {
      transitionRef.current = {
        elapsed: 0,
        startAzimuth: controls.getAzimuthalAngle(),
        startPolar: controls.getPolarAngle(),
        startTarget: controls.target.clone(),
      };
    } else if (!isIdle) {
      transitionRef.current = null;
    }

    prevIsIdleRef.current = isIdle;

    if (isIdle) {
      idleTimeRef.current += delta;
      const t = idleTimeRef.current;
      const idleAzimuth = Math.sin(t * idleSpeed) * IDLE_AZIMUTH_AMPLITUDE;
      const idlePolar =
        IDLE_POLAR_BASE + Math.sin(t * idleSpeed * 0.7) * IDLE_POLAR_AMPLITUDE;

      idleTargetRef.current.set(
        Math.cos(t * idleSpeed * 0.4) * IDLE_TARGET_RADIUS,
        Math.sin(t * idleSpeed * 0.9) * IDLE_TARGET_Y_AMPLITUDE,
        Math.sin(t * idleSpeed * 0.4) * IDLE_TARGET_RADIUS
      );

      const transition = transitionRef.current;
      if (transition) {
        transition.elapsed += delta;
        const progress = Math.min(
          transition.elapsed / IDLE_TRANSITION_DURATION,
          1
        );
        const eased = progress * progress * (3 - 2 * progress);
        const azimuth =
          transition.startAzimuth +
          (idleAzimuth - transition.startAzimuth) * eased;
        const polar =
          transition.startPolar + (idlePolar - transition.startPolar) * eased;
        blendTargetRef.current
          .copy(transition.startTarget)
          .lerp(idleTargetRef.current, eased);
        controls.setAzimuthalAngle(azimuth);
        controls.setPolarAngle(polar);
        controls.target.copy(blendTargetRef.current);

        if (progress >= 1) {
          transitionRef.current = null;
        }
      } else {
        controls.setAzimuthalAngle(idleAzimuth);
        controls.setPolarAngle(idlePolar);
        controls.target.copy(idleTargetRef.current);
      }
    }
    controls.update();
  });

  return <OrbitControls ref={controlsRef} {...props} />;
}
