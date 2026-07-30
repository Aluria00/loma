"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const RAMP = [" ", "·", ".", "-", ":", "=", "+", "x", "#"];

function ridge(
  x: number,
  seed: number,
  baseY: number,
  amp: number,
  freq: number
) {
  let y = baseY;
  y += Math.sin(x * freq + seed) * amp * 0.55;
  y += Math.sin(x * freq * 2.3 + seed * 1.7) * amp * 0.28;
  y += Math.sin(x * freq * 4.9 + seed * 0.9) * amp * 0.14;
  return y;
}

function sample(x: number, y: number, w: number, h: number) {
  const layers = [
    { baseY: h * 0.52, amp: h * 0.18, freq: 0.008, seed: 1.1, weight: 0.28 },
    { baseY: h * 0.74, amp: h * 0.14, freq: 0.011, seed: 3.7, weight: 0.38 },
    { baseY: h * 0.93, amp: h * 0.06, freq: 0.017, seed: 6.2, weight: 0.52 },
  ];
  let v = 0;
  for (const L of layers) {
    const ry = ridge(x, L.seed, L.baseY, L.amp, L.freq);
    if (y < ry) continue;
    const d = Math.min((y - ry) / Math.max(h - ry, 1), 1);
    const b = (1 - d * 0.65) * L.weight;
    const nx = Math.sin(x * 0.013 + y * 0.009 + L.seed) * 0.5 + 0.5;
    v += b * (0.7 + nx * 0.6);
  }
  return Math.min(v, 1);
}

type Glyph = { x: number; y: number; ch: string; a: number; p: number };

/** Login-page ASCII ridge field — ported from the marketing site. */
export function LoginDotfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let glyphs: Glyph[] = [];
    let w = 0;
    let h = 0;
    let resizeT: ReturnType<typeof setTimeout> | null = null;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.min(cv.clientWidth || 0, 2400);
      h = Math.min(cv.clientHeight || 0, 1200);
      if (!w || !h) {
        glyphs = [];
        return;
      }
      const maxGlyphs = Math.min(3600, Math.max(350, Math.floor((w * h) / 140)));
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = '9px "SF Mono","Menlo","Consolas",ui-monospace,monospace';
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      glyphs = [];
      const stepX = 8;
      const stepY = 10;
      outer: for (let y = 0; y < h; y += stepY) {
        for (let x = 0; x < w; x += stepX) {
          const v = sample(x + 4, y + 5, w, h);
          if (v < 0.08) continue;
          const idx = Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1)));
          glyphs.push({
            x: x + 4,
            y: y + 5,
            ch: RAMP[idx],
            a: 0.15 + v * 0.85,
            p: Math.random() * Math.PI * 2,
          });
          if (glyphs.length >= maxGlyphs) break outer;
        }
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#00C419";
      for (const g of glyphs) {
        const pulse = 0.82 + Math.sin(t * 0.0012 + g.p) * 0.18;
        ctx.globalAlpha = g.a * pulse;
        ctx.fillText(g.ch, g.x, g.y);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      if (resizeT) clearTimeout(resizeT);
      resizeT = setTimeout(build, 120);
    };

    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (resizeT) clearTimeout(resizeT);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="dotfield-accent dotfield-accent--login"
      aria-hidden="true"
    />
  );
}
