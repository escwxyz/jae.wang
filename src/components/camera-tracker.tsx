import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";

interface Props {
  x: MotionValue<number>;
  y: MotionValue<number>;
  z: MotionValue<number>;
}

export const CameraTracker = ({ x, y, z }: Props) => {
  const { camera } = useThree();

  useFrame(() => {
    x.set(camera.position.x);
    y.set(camera.position.y);
    z.set(camera.position.z);
  });

  return null;
};
