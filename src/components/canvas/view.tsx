import {
  OrbitControls,
  PerspectiveCamera,
  View as ViewImpl,
} from "@react-three/drei";
import {
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  Suspense,
  useImperativeHandle,
  useRef,
} from "react";
import type { Color } from "three";
import { Three } from "@/helpers/components/Three";

export const Common = ({ color }: { color?: Color }) => (
  <Suspense fallback={null}>
    {color && <color args={[color]} attach="background" />}
    <ambientLight intensity={0.2} />
    <pointLight intensity={0.5} position={[10, 10, 10]} />
    <PerspectiveCamera fov={40} makeDefault position={[0, 0, 6]} />
  </Suspense>
);

// Views use gl.scissor to cut the viewport into segments.
// You tie a view to a tracking div which then controls the position and bounds of the viewport.
// This allows you to have multiple views with a single, performant canvas.

interface ViewProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  orbit?: boolean;
  ref?: RefObject<unknown>;
}

const View = ({ children, orbit, ref, ...props }: ViewProps) => {
  // biome-ignore lint/style/noNonNullAssertion: <ignore>
  const localRef = useRef<HTMLDivElement>(null!);
  useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>
          {children}
          {orbit && <OrbitControls />}
        </ViewImpl>
      </Three>
    </>
  );
};

View.displayName = "View";

export { View };
