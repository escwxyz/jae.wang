import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { EnduranceModel } from "./endurance-model";

interface Props {
  spinDuration?: number;
}

export const SpinningEnduranceModel = ({ spinDuration = 11.4 }: Props) => {
  const spinSpeed = useMemo(() => (Math.PI * 2) / spinDuration, [spinDuration]);

  const spinRef = useRef<Group>(null);

  useFrame((state) => {
    const ship = spinRef.current;
    if (!ship) {
      return;
    }
    ship.rotation.z = state.clock.elapsedTime * spinSpeed;
  });

  return (
    <group position={[6, -2, 4]} rotation={[0, Math.PI, 0]} scale={0.2}>
      <group ref={spinRef}>
        <EnduranceModel />
      </group>
    </group>
  );
};
