import { useFrame, useThree } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import type { Group } from "three";
import { Vector3 } from "three";
import { EnduranceModel } from "./endurance-model";

const MemorizedEnduranceModel = memo(EnduranceModel);

interface Props {
  spinDuration?: number;
  isIdle?: boolean;
}

const IDLE_POSITION = new Vector3(6, -2, 4);
const ACTIVE_POSITION = new Vector3(8.5, -3.2, 5);
const MOBILE_IDLE_POSITION = new Vector3(0.8, -2.4, 8);
const MOBILE_ACTIVE_POSITION = new Vector3(1.6, -2.2, 4.6);
const POSITION_DAMPING = 3;

export const SpinningEnduranceModel = ({
  spinDuration = 11.4,
  isIdle = true,
}: Props) => {
  const spinSpeed = useMemo(() => (Math.PI * 2) / spinDuration, [spinDuration]);
  const { width } = useThree((state) => state.size);
  const isMobile = width < 640;
  const idlePosition = useMemo(
    () => (isMobile ? MOBILE_IDLE_POSITION : IDLE_POSITION),
    [isMobile]
  );
  const activePosition = useMemo(
    () => (isMobile ? MOBILE_ACTIVE_POSITION : ACTIVE_POSITION),
    [isMobile]
  );

  const groupRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const ship = spinRef.current;
    if (!(group && ship)) {
      return;
    }
    const target = isIdle ? idlePosition : activePosition;
    const lerp = 1 - Math.exp(-POSITION_DAMPING * delta);
    group.position.lerp(target, lerp);
    ship.rotation.z = state.clock.elapsedTime * spinSpeed;
  });

  return (
    <group
      position={idlePosition}
      ref={groupRef}
      rotation={[0, Math.PI, 0]}
      scale={isMobile ? 0.1 : 0.2}
    >
      <group ref={spinRef}>
        <MemorizedEnduranceModel />
      </group>
    </group>
  );
};
