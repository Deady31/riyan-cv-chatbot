"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

interface LiquidMetalRingProps {
  width: number | string;
  height: number | string;
  borderRadius?: number | string;
  ringWidth?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Contour liquid metal générique : le shader remplit toute la forme, un
// enfant décalé de `ringWidth` masque le centre — seul l'anneau reste visible.
// Léger comparé à LiquidMetalButton (pas de ripple/press/label), pensé pour
// entourer un élément existant (avatar, barre de saisie) sans changer son style.
export function LiquidMetalRing({
  width,
  height,
  borderRadius = 9999,
  ringWidth = 2,
  className = "",
  style,
  children,
}: LiquidMetalRingProps) {
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<{ destroy?: () => void } | null>(null);

  useEffect(() => {
    const styleId = "liquid-metal-ring-canvas-style";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        .liquid-metal-ring-canvas canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          mix-blend-mode: screen;
        }
      `;
      document.head.appendChild(styleEl);
    }

    let cancelled = false;
    (async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");
        if (cancelled || !shaderRef.current) return;
        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          0.6
        );
      } catch (err) {
        console.error("Erreur chargement shader liquid metal (ring):", err);
      }
    })();

    return () => {
      cancelled = true;
      shaderMount.current?.destroy?.();
      shaderMount.current = null;
    };
  }, []);

  const innerRadius =
    typeof borderRadius === "number" ? Math.max(0, borderRadius - ringWidth) : borderRadius;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height, borderRadius, ...style }}>
      {/* Base métallique statique — garantit un contour toujours "rempli" même
          là où le shader (animé, pas uniforme) passe par une zone sombre. */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius,
          background:
            "conic-gradient(from 180deg, #9a9a9a, #f2f2f2, #6e6e6e, #d0d0d0, #8a8a8a, #f2f2f2, #9a9a9a)",
        }}
      />
      <div
        ref={shaderRef}
        className="liquid-metal-ring-canvas absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      />
      <div className="absolute overflow-hidden" style={{ inset: ringWidth, borderRadius: innerRadius }}>
        {children}
      </div>
    </div>
  );
}
