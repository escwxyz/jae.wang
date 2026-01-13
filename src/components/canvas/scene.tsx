import { Preload, Stats } from "@react-three/drei";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { r3f, ui } from "@/helpers/global";

export const Scene = (props: CanvasProps) => {
  return (
    <>
      <Canvas
        className="pointer-events-auto"
        {...props}
        // camera={{ position: [-20, 35, 30], fov: 45, near: 1, far: 60 }}
        dpr={[1, 2]}
      >
        <r3f.Out />
        {process.env.NODE_ENV === "development" && <Stats />}
        <Preload all />
      </Canvas>
      <ui.Out />
    </>
  );
};
