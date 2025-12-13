import {
  Show,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
} from "solid-js";
import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";
import gsap from "gsap/gsap-core";
import { hexToRgb } from "@/utils/hexToRGB";
import type { Component } from "solid-js";

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: Array<string>;
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  class?: string;
}

// Default colors for the particles, using CSS variables for theming.
const defaultColors: Array<string> = [
  "var(--color-background)",
  "var(--color-primary-500)",
  "var(--color-accent-500)",
];

/**
 * @function isWebglSupported
 * @description Checks if the browser supports WebGL.
 * @returns {boolean} True if WebGL is supported, false otherwise.
 */
const isWebglSupported = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch (e) {
    return false;
  }
};

// GLSL vertex shader code for positioning and sizing particles.
const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    // Spread particles in a spherical volume
    vec3 pos = position * uSpread;
    pos.z *= 10.0; // Stretch the distribution along the z-axis

    vec4 mPos = modelMatrix * vec4(pos, 1.0);

    // Animate particle positions using sine waves and random values for a natural, floating effect
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;

    // Calculate particle size, adjusting for perspective
    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      // Apply size randomness and scale by distance to create a 3D perspective effect
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

// GLSL fragment shader for coloring the particles.
const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5)); // Distance from the center of the point

    // Determine if particles should be solid circles or have soft, alpha-blended edges
    if(uAlphaParticles < 0.5) {
      // Discard pixels outside the circular shape for hard edges
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      // Use smoothstep for a soft, anti-aliased edge
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

/**
 * @component Particles
 * @description A SolidJS component that renders an animated 3D particle background using OGL (a minimal WebGL library) and GSAP.
 * It creates a spherical distribution of particles that float and can optionally react to mouse movement.
 * @param {ParticlesProps} props - The properties to customize the particle system.
 * @returns {JSX.Element} A div element that contains the WebGL canvas or a fallback message.
 */
const Particles: Component<ParticlesProps> = (props) => {
  // Merge user-provided props with default values to ensure all options are set.
  const merged = mergeProps(
    {
      particleCount: 200,
      particleSpread: 10,
      speed: 0.1,
      particleColors: defaultColors,
      moveParticlesOnHover: false,
      particleHoverFactor: 1,
      alphaParticles: false,
      particleBaseSize: 100,
      sizeRandomness: 1,
      cameraDistance: 20,
      disableRotation: false,
    },
    props,
  );

  // A ref to hold the container div element for the WebGL canvas.
  let containerRef: HTMLDivElement | undefined;
  // A plain object to store the latest normalized mouse position (-1 to 1).
  const mousePos = { x: 0, y: 0 };
  // A signal to track WebGL support.
  const [webglSupported, setWebglSupported] = createSignal(true);
  // Signal to hold particle data - initialized empty and populated asynchronously
  const [particleData, setParticleData] = createSignal({
    positions: new Float32Array(0),
    randoms: new Float32Array(0),
    colors: new Float32Array(0),
  });
  // Signal to track loading state
  const [isLoading, setIsLoading] = createSignal(true);

  // onMount runs once after the component's DOM elements are mounted.
  onMount(() => {
    if (!isWebglSupported()) {
      setWebglSupported(false);
      console.warn("WebGL is not supported. Particle background is disabled.");
      return;
    }

    if (!containerRef) return;

    // Fade in the canvas container for a smooth appearance.
    gsap.fromTo(containerRef, { opacity: 0 }, { opacity: 1, duration: 1 });

    // OPTIMIZATION: Use requestIdleCallback for better scheduling of heavy calculations
    // This allows the browser to run calculations during idle periods, preventing UI blocking
    const scheduleHeavyWork = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            calculateParticleData();
          },
          { timeout: 1000 }, // Ensure it runs within 1 second even if browser is busy
        );
      } else {
        // Fallback to setTimeout for browsers that don't support requestIdleCallback
        setTimeout(calculateParticleData, 0);
      }
    };

    const calculateParticleData = () => {
      const count = merged.particleCount;
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);

      const palette =
        merged.particleColors.length > 0
          ? merged.particleColors
          : defaultColors;

      // OPTIMIZATION: Pre-calculate colors ONCE outside the loop
      // This avoids calling getComputedStyle for each particle (200+ times)
      const resolvedPalette: [number, number, number][] = [];
      for (const color of palette) {
        try {
          const rgb = hexToRgb(color, true);
          resolvedPalette.push(rgb);
        } catch (e) {
          console.warn(
            `Invalid color string in particleColors: ${color}. Using fallback white.`,
            e,
          );
          resolvedPalette.push([1, 1, 1]); // fallback white (normalized)
        }
      }

      // If palette is empty after processing, use a default white color
      if (resolvedPalette.length === 0) {
        resolvedPalette.push([1, 1, 1]);
      }

      for (let i = 0; i < count; i++) {
        let x: number, y: number, z: number, len: number;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = Math.random() * 2 - 1;
          len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);

        const r = Math.cbrt(Math.random());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set(
          [Math.random(), Math.random(), Math.random(), Math.random()],
          i * 4,
        );

        // Use the pre-calculated color array
        const col =
          resolvedPalette[Math.floor(Math.random() * resolvedPalette.length)];
        colors.set(col, i * 3);
      }

      setParticleData({ positions, randoms, colors });
      setIsLoading(false);
    };

    scheduleHeavyWork();
  });

  // createEffect re-runs when its dependencies change, rebuilding the WebGL scene.
  createEffect(() => {
    if (!webglSupported() || !containerRef) return;

    const data = particleData();
    // Don't initialize WebGL until particle data is ready
    if (data.positions.length === 0) return;

    const container = containerRef;
    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, merged.cameraDistance);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, false);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.x = x;
      mousePos.y = y;
    };

    if (merged.moveParticlesOnHover) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: data.positions },
      random: { size: 4, data: data.randoms },
      color: { size: 3, data: data.colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: merged.particleSpread },
        uBaseSize: { value: merged.particleBaseSize },
        uSizeRandomness: { value: merged.sizeRandomness },
        uAlphaParticles: { value: merged.alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId: number;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t: number) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * merged.speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (merged.moveParticlesOnHover) {
        particles.position.x = -mousePos.x * merged.particleHoverFactor;
        particles.position.y = -mousePos.y * merged.particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!merged.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * merged.speed;
      }

      renderer.render({ scene: particles, camera });
    };

    animationFrameId = requestAnimationFrame(update);

    onCleanup(() => {
      window.removeEventListener("resize", resize);
      if (merged.moveParticlesOnHover) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    });
  });

  return (
    <div
      ref={containerRef}
      class={`relative h-full w-full ${merged.class || ""}`}
    >
      {/* Loading skeleton */}
      <Show when={isLoading()}>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span class="sr-only">Loading particles...</span>
          </div>
        </div>
      </Show>

      <Show when={!webglSupported()}>
        <div class="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          <p>WebGL is not supported on this browser.</p>
        </div>
      </Show>
    </div>
  );
};

export default Particles;
