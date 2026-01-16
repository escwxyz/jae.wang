import { createPortal } from "@react-three/fiber";
import { memo, type RefObject } from "react";
import {
  GLSL3,
  type IUniform,
  type OrthographicCamera,
  type Scene,
} from "three";
import vertexShader from "./vertex.glsl?raw";

interface PassProps {
  cameraRef: RefObject<OrthographicCamera>;
  fragmentShader: string;
  scene: Scene;
  uniforms: Record<string, IUniform>;
}

export const FullscreenPass = memo(
  ({ cameraRef, fragmentShader, scene, uniforms }: PassProps) => {
    return createPortal(
      <>
        <orthographicCamera args={[-1, 1, 1, -1, 0, 1]} ref={cameraRef} />
        <mesh frustumCulled={false}>
          <planeGeometry args={[2, 2]} />
          <rawShaderMaterial
            depthTest={false}
            depthWrite={false}
            fragmentShader={fragmentShader}
            glslVersion={GLSL3}
            toneMapped={false}
            uniforms={uniforms}
            vertexShader={vertexShader}
          />
        </mesh>
      </>,
      scene
    );
  }
);
