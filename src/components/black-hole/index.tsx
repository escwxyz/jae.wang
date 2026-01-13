import { useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import {
  DataTexture,
  GLSL3,
  type IUniform,
  LinearFilter,
  LinearMipmapLinearFilter,
  type OrthographicCamera,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  Vector2,
  Vector3,
} from "three";
import fragmentBloomMips from "./bloom-pass.glsl?raw";
import fragmentFinal from "./final.glsl?raw";
import fragmentBlurH from "./horizontal-blur.glsl?raw";
import { FullscreenPass } from "./pass";
import fragmentMain from "./temporal-aa.glsl?raw";
import vertexShader from "./vertex.glsl?raw";
import fragmentBlurV from "./vertical-blur.glsl?raw";

interface SharedUniforms {
  iResolution: { value: Vector3 };
  iTime: { value: number };
}

function createNoiseTexture(size: number) {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size * 4; i += 4) {
    data[i] = Math.random() * 255;
    data[i + 1] = Math.random() * 255;
    data[i + 2] = Math.random() * 255;
    data[i + 3] = 255;
  }

  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export const BlackHole = () => {
  const { gl, size } = useThree();
  const controls = useControls({
    "Black Hole": folder(
      {
        View: folder(
          {
            far: {
              value: 15.0,
              min: 6.0,
              max: 30.0,
              step: 0.5,
            },
            eyeDepth: {
              value: 4.5,
              min: 2.0,
              max: 9.0,
              step: 0.25,
            },

            viewOffsetX: {
              value: 0.3,
              min: -0.8,
              max: 0.8,
              step: 0.01,
            },
            viewOffsetY: {
              value: -0.3,
              min: -0.8,
              max: 0.8,
              step: 0.01,
            },
          },
          {
            collapsed: true,
          }
        ),

        Disc: folder(
          {
            warpAmount: {
              value: 5.0,
              min: 0.5,
              max: 10.0,
              step: 0.1,
            },
            discRadius: {
              value: 3.2,
              min: 1.0,
              max: 6.0,
              step: 0.1,
            },
            discWidth: {
              value: 5.3,
              min: 1.0,
              max: 8.0,
              step: 0.1,
            },
          },
          {
            collapsed: true,
          }
        ),

        Temporal: folder(
          {
            timeScale: {
              value: 2.1,
              min: 0.0,
              max: 4.0,
              step: 0.05,
            },
            starTimeScale: {
              value: 1.0,
              min: 0.0,
              max: 4.0,
              step: 0.05,
            },
            temporalBlend: {
              value: 0.85,
              min: 0.0,
              max: 0.98,
              step: 0.01,
            },
            temporalJitter: {
              value: 1.0,
              min: 0.0,
              max: 1.5,
              step: 0.05,
            },
          },
          {
            collapsed: true,
          }
        ),

        Color: folder(
          {
            exposure: {
              value: 100,
              min: 20,
              max: 200,
              step: 5,
            },
            highlightClamp: {
              value: 1.0,
              min: 0.5,
              max: 2.0,
              step: 0.05,
            },
            toneMapPowerR: {
              value: 1.3,
              min: 0.8,
              max: 2.0,
              step: 0.05,
            },
            toneMapPowerG: {
              value: 1.2,
              min: 0.8,
              max: 2.0,
              step: 0.05,
            },
            toneMapPowerB: {
              value: 1.0,
              min: 0.8,
              max: 2.0,
              step: 0.05,
            },
            finalGamma: {
              value: 0.7 / 2.2,
              min: 0.2,
              max: 0.8,
              step: 0.01,
            },
            saturation: {
              value: 1.0,
              min: 0.0,
              max: 2.0,
              step: 0.05,
            },
            colorGainR: {
              value: 1.0,
              min: 0.5,
              max: 2.0,
              step: 0.05,
            },
            colorGainG: {
              value: 1.0,
              min: 0.5,
              max: 2.0,
              step: 0.05,
            },
            colorGainB: {
              value: 1.0,
              min: 0.5,
              max: 2.0,
              step: 0.05,
            },
          },
          {
            collapsed: true,
          }
        ),

        Matte: folder(
          {
            alphaThreshold: {
              value: 0.02,
              min: 0.0,
              max: 0.2,
              step: 0.01,
            },
            alphaSoftness: {
              value: 0.15,
              min: 0.01,
              max: 0.5,
              step: 0.01,
            },
          },
          { collapsed: true }
        ),

        bloomStrength: {
          value: 0.03,
          min: 0.0,
          max: 0.3,
          step: 0.01,
        },

        renderScale: {
          value: 1.0,
          min: 0.5,
          max: 1.0,
          step: 0.05,
        },
      },
      {
        collapsed: true,
      }
    ),

    "Star Nest": folder(
      {
        starZoom: {
          value: 1.2,
          min: 0.6,
          max: 2.0,
          step: 0.05,
        },
        starSpeed: {
          value: 0.002,
          min: 0.0,
          max: 0.005,
          step: 0.0005,
        },
        starBrightness: {
          value: 0.0015,
          min: 0.0002,
          max: 0.005,
          step: 0.0001,
        },
        starDarkmatter: {
          value: 1.0,
          min: 0.2,
          max: 2.0,
          step: 0.05,
        },
        starDistfading: {
          value: 0.73,
          min: 0.5,
          max: 0.9,
          step: 0.01,
        },
        starSaturation: {
          value: 1.0,
          min: 0.0,
          max: 2.0,
          step: 0.05,
        },
        starFormuparam: {
          value: 0.57,
          min: 0.2,
          max: 1.0,
          step: 0.01,
        },
        starTile: {
          value: 1.0,
          min: 0.5,
          max: 2.0,
          step: 0.05,
        },
        starStepsize: {
          value: 0.2,
          min: 0.05,
          max: 0.5,
          step: 0.01,
        },
        starCenterX: {
          value: 0.35,
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
        starCenterY: {
          value: 0.6,
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
        starHoleRadius: {
          value: 0.25,
          min: 0.05,
          max: 0.6,
          step: 0.01,
        },
        starHoleSoftness: {
          value: 0.08,
          min: 0.01,
          max: 0.3,
          step: 0.01,
        },
      },
      {
        collapsed: true,
      }
    ),
  });

  const pixelRatio = gl.getPixelRatio() * controls.renderScale;
  const width = Math.max(1, Math.floor(size.width * pixelRatio));
  const height = Math.max(1, Math.floor(size.height * pixelRatio));

  const noiseTexture = useMemo(() => createNoiseTexture(256), []);
  const dustTexture = useMemo(() => createNoiseTexture(128), []);
  const drawBufferSize = useMemo(() => new Vector2(), []);

  const sharedUniforms = useMemo<SharedUniforms>(
    () => ({
      iResolution: { value: new Vector3() },
      iTime: { value: 0 },
    }),
    []
  );

  const historyA = useFBO(width, height, {
    // depth: false,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
  });
  const historyB = useFBO(width, height, {
    // depth: false,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
  });
  const bloomTarget = useFBO(width, height, {
    // depth: false,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
  });
  const blurHTarget = useFBO(width, height, {
    // depth: false,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
  });
  const blurVTarget = useFBO(width, height, {
    // depth: false,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    stencilBuffer: false,
  });

  const historyRef = useRef({ read: historyA, write: historyB });

  useEffect(() => {
    historyRef.current = { read: historyA, write: historyB };
  }, [historyA, historyB]);

  const mainUniforms = useMemo<Record<string, IUniform>>(
    () => ({
      iResolution: sharedUniforms.iResolution,
      iTime: sharedUniforms.iTime,
      uWarpAmount: { value: 5.0 },
      uDiscRadius: { value: 3.2 },
      uDiscWidth: { value: 5.3 },
      uFar: { value: 15.0 },
      uEyeDepth: { value: 6.0 },
      uViewOffset: { value: new Vector2(0.35, -0.35) },
      uTemporalBlend: { value: 0.85 },
      uTemporalJitter: { value: 1.0 },
      iChannel0: { value: noiseTexture },
      iChannel1: { value: dustTexture },
      iChannel2: { value: noiseTexture },
    }),
    [dustTexture, noiseTexture, sharedUniforms]
  );

  const bloomUniforms = useMemo<Record<string, IUniform>>(
    () => ({
      iResolution: sharedUniforms.iResolution,
      iChannel0: { value: noiseTexture },
    }),
    [noiseTexture, sharedUniforms]
  );

  const blurHUniforms = useMemo<Record<string, IUniform>>(
    () => ({
      iResolution: sharedUniforms.iResolution,
      iChannel0: { value: noiseTexture },
    }),
    [noiseTexture, sharedUniforms]
  );

  const blurVUniforms = useMemo<Record<string, IUniform>>(
    () => ({
      iResolution: sharedUniforms.iResolution,
      iChannel0: { value: noiseTexture },
    }),
    [noiseTexture, sharedUniforms]
  );

  const finalUniforms = useMemo<Record<string, IUniform>>(
    () => ({
      iResolution: sharedUniforms.iResolution,
      iTime: sharedUniforms.iTime,
      iStarTime: { value: 0 },
      iChannel0: { value: noiseTexture },
      iChannel3: { value: noiseTexture },
      uBloomStrength: { value: 0.08 },
      uExposure: { value: 200 },
      uHighlightClamp: { value: 1.0 },
      uToneMapPower: { value: new Vector3(1.3, 1.2, 1.0) },
      uFinalGamma: { value: 0.7 / 2.2 },
      uSaturation: { value: 1.0 },
      uColorGain: { value: new Vector3(1.0, 1.0, 1.0) },
      uAlphaThreshold: { value: 0.02 },
      uAlphaSoftness: { value: 0.15 },
      uStarZoom: { value: 1.2 },
      uStarSpeed: { value: 0.01 },
      uStarBrightness: { value: 0.0015 },
      uStarDarkmatter: { value: 1.0 },
      uStarDistfading: { value: 0.73 },
      uStarSaturation: { value: 1.0 },
      uStarFormuparam: { value: 0.57 },
      uStarTile: { value: 1.0 },
      uStarStepsize: { value: 0.2 },
      uStarCenter: { value: new Vector2(0.35, 0.6) },
      uViewOffset: { value: new Vector2(-0.3, 0.3) },
      uStarHoleRadius: { value: 0.25 },
      uStarHoleSoftness: { value: 0.08 },
    }),
    [noiseTexture, sharedUniforms]
  );

  const mainScene = useMemo(() => new Scene(), []);
  const bloomScene = useMemo(() => new Scene(), []);
  const blurHScene = useMemo(() => new Scene(), []);
  const blurVScene = useMemo(() => new Scene(), []);

  const mainCamera = useRef<OrthographicCamera>(null);
  const bloomCamera = useRef<OrthographicCamera>(null);
  const blurHCamera = useRef<OrthographicCamera>(null);
  const blurVCamera = useRef<OrthographicCamera>(null);

  useEffect(() => {
    finalUniforms.uBloomStrength.value = controls.bloomStrength;
    finalUniforms.uExposure.value = controls.exposure;
    finalUniforms.uHighlightClamp.value = controls.highlightClamp;
    finalUniforms.uToneMapPower.value.set(
      controls.toneMapPowerR,
      controls.toneMapPowerG,
      controls.toneMapPowerB
    );
    finalUniforms.uFinalGamma.value = controls.finalGamma;
    finalUniforms.uSaturation.value = controls.saturation;
    finalUniforms.uColorGain.value.set(
      controls.colorGainR,
      controls.colorGainG,
      controls.colorGainB
    );
    finalUniforms.uAlphaThreshold.value = controls.alphaThreshold;
    finalUniforms.uAlphaSoftness.value = controls.alphaSoftness;
    finalUniforms.uStarZoom.value = controls.starZoom;
    finalUniforms.uStarSpeed.value = controls.starSpeed;
    finalUniforms.uStarBrightness.value = controls.starBrightness;
    finalUniforms.uStarDarkmatter.value = controls.starDarkmatter;
    finalUniforms.uStarDistfading.value = controls.starDistfading;
    finalUniforms.uStarSaturation.value = controls.starSaturation;
    finalUniforms.uStarFormuparam.value = controls.starFormuparam;
    finalUniforms.uStarTile.value = controls.starTile;
    finalUniforms.uStarStepsize.value = controls.starStepsize;
    finalUniforms.uStarCenter.value.set(
      controls.starCenterX,
      controls.starCenterY
    );
    finalUniforms.uViewOffset.value.set(
      controls.viewOffsetX,
      controls.viewOffsetY
    );
    finalUniforms.uStarHoleRadius.value = controls.starHoleRadius;
    finalUniforms.uStarHoleSoftness.value = controls.starHoleSoftness;
  }, [
    controls.alphaSoftness,
    controls.alphaThreshold,
    controls.bloomStrength,
    controls.colorGainB,
    controls.colorGainG,
    controls.colorGainR,
    controls.exposure,
    controls.finalGamma,
    controls.highlightClamp,
    controls.saturation,
    controls.starBrightness,
    controls.starDarkmatter,
    controls.starDistfading,
    controls.starFormuparam,
    controls.starHoleRadius,
    controls.starHoleSoftness,
    controls.starSaturation,
    controls.starSpeed,
    controls.starStepsize,
    controls.starTile,
    controls.starZoom,
    controls.starCenterX,
    controls.starCenterY,
    controls.toneMapPowerB,
    controls.toneMapPowerG,
    controls.toneMapPowerR,
    controls.viewOffsetX,
    controls.viewOffsetY,
    finalUniforms,
  ]);

  useEffect(() => {
    mainUniforms.uWarpAmount.value = controls.warpAmount;
    mainUniforms.uDiscRadius.value = controls.discRadius;
    mainUniforms.uDiscWidth.value = controls.discWidth;
    mainUniforms.uFar.value = controls.far;
    mainUniforms.uEyeDepth.value = controls.eyeDepth;
    mainUniforms.uViewOffset.value.set(
      controls.viewOffsetX,
      controls.viewOffsetY
    );
    mainUniforms.uTemporalBlend.value = controls.temporalBlend;
    mainUniforms.uTemporalJitter.value = controls.temporalJitter;
  }, [
    controls.discRadius,
    controls.discWidth,
    controls.eyeDepth,
    controls.far,
    controls.temporalBlend,
    controls.temporalJitter,
    controls.viewOffsetX,
    controls.viewOffsetY,
    controls.warpAmount,
    mainUniforms,
  ]);

  useFrame((state) => {
    drawBufferSize.set(width, height);
    sharedUniforms.iResolution.value.set(drawBufferSize.x, drawBufferSize.y, 1);
    sharedUniforms.iTime.value = state.clock.elapsedTime * controls.timeScale;
    finalUniforms.iStarTime.value =
      state.clock.elapsedTime * controls.starTimeScale;

    const mainCameraValue = mainCamera.current;
    const bloomCameraValue = bloomCamera.current;
    const blurHCameraValue = blurHCamera.current;
    const blurVCameraValue = blurVCamera.current;

    if (
      !(
        mainCameraValue &&
        bloomCameraValue &&
        blurHCameraValue &&
        blurVCameraValue
      )
    ) {
      return;
    }

    mainUniforms.iChannel2.value = historyRef.current.read.texture;

    gl.setRenderTarget(historyRef.current.write);
    gl.render(mainScene, mainCameraValue);

    bloomUniforms.iChannel0.value = historyRef.current.write.texture;
    gl.setRenderTarget(bloomTarget);
    gl.render(bloomScene, bloomCameraValue);

    blurHUniforms.iChannel0.value = bloomTarget.texture;
    gl.setRenderTarget(blurHTarget);
    gl.render(blurHScene, blurHCameraValue);

    blurVUniforms.iChannel0.value = blurHTarget.texture;
    gl.setRenderTarget(blurVTarget);
    gl.render(blurVScene, blurVCameraValue);

    finalUniforms.iChannel0.value = historyRef.current.write.texture;
    finalUniforms.iChannel3.value = blurVTarget.texture;

    gl.setRenderTarget(null);

    const temp = historyRef.current.read;
    historyRef.current.read = historyRef.current.write;
    historyRef.current.write = temp;

    gl.setScissorTest(false);
  }, -1);

  return (
    <>
      <FullscreenPass
        cameraRef={mainCamera}
        fragmentShader={fragmentMain}
        scene={mainScene}
        uniforms={mainUniforms}
      />
      <FullscreenPass
        cameraRef={bloomCamera}
        fragmentShader={fragmentBloomMips}
        scene={bloomScene}
        uniforms={bloomUniforms}
      />
      <FullscreenPass
        cameraRef={blurHCamera}
        fragmentShader={fragmentBlurH}
        scene={blurHScene}
        uniforms={blurHUniforms}
      />
      <FullscreenPass
        cameraRef={blurVCamera}
        fragmentShader={fragmentBlurV}
        scene={blurVScene}
        uniforms={blurVUniforms}
      />
      <mesh frustumCulled={false} position={[0, 0, -50]} renderOrder={-10}>
        <planeGeometry args={[2, 2]} />
        <rawShaderMaterial
          depthTest={false}
          depthWrite={false}
          fragmentShader={fragmentFinal}
          glslVersion={GLSL3}
          toneMapped={false}
          transparent
          uniforms={finalUniforms}
          vertexShader={vertexShader}
        />
      </mesh>
    </>
  );
};
