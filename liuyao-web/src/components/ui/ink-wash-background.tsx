'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-screen ink wash background with floating golden particles.
 * Stronger blobs + more particles for visible atmosphere.
 */
export function InkWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    // ── Particles ──
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      opacityDir: number;
      color: string;
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 80;

    // ── Ink wash blobs ──
    interface InkBlob {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      baseOpacity: number;
      opacityDir: number;
      speed: number;
      angle: number;
      color: [number, number, number];
    }

    const blobs: InkBlob[] = [];
    const BLOB_COUNT = 8;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25 - 0.08,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.15,
          opacityDir: (Math.random() - 0.5) * 0.004,
          color: Math.random() > 0.12
            ? '196,149,107'
            : '139,58,58',
        });
      }
    }

    function initBlobs() {
      blobs.length = 0;
      const configs: { color: [number, number, number]; opRange: [number, number]; rRange: [number, number] }[] = [
        // Large warm gold blobs — main atmosphere
        { color: [196, 149, 107], opRange: [0.06, 0.16], rRange: [400, 700] },
        { color: [196, 149, 107], opRange: [0.05, 0.14], rRange: [350, 600] },
        { color: [180, 140, 100], opRange: [0.04, 0.12], rRange: [300, 550] },
        // Medium blobs
        { color: [196, 149, 107], opRange: [0.05, 0.13], rRange: [250, 450] },
        { color: [170, 130, 90],  opRange: [0.04, 0.11], rRange: [200, 400] },
        // Cinnabar accents
        { color: [139, 58, 58],   opRange: [0.03, 0.08], rRange: [200, 400] },
        { color: [139, 58, 58],   opRange: [0.02, 0.06], rRange: [150, 350] },
        // Subtle warm white haze
        { color: [220, 200, 170], opRange: [0.02, 0.05], rRange: [300, 500] },
      ];

      for (let i = 0; i < BLOB_COUNT; i++) {
        const cfg = configs[i];
        const baseOp = cfg.opRange[0] + Math.random() * (cfg.opRange[1] - cfg.opRange[0]);
        blobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: cfg.rRange[0] + Math.random() * (cfg.rRange[1] - cfg.rRange[0]),
          opacity: baseOp,
          baseOpacity: baseOp,
          opacityDir: (Math.random() > 0.5 ? 1 : -1) * (0.0002 + Math.random() * 0.0004),
          speed: Math.random() * 0.12 + 0.03,
          angle: Math.random() * Math.PI * 2,
          color: cfg.color,
        });
      }
    }

    function draw() {
      // Clear
      ctx!.fillStyle = '#0D0B08';
      ctx!.fillRect(0, 0, width, height);

      // ── Ink wash blobs ──
      for (const blob of blobs) {
        blob.x += Math.cos(blob.angle) * blob.speed;
        blob.y += Math.sin(blob.angle) * blob.speed;
        blob.angle += (Math.random() - 0.5) * 0.008;

        // Soft wrap
        if (blob.x < -blob.radius * 0.5) blob.x = width + blob.radius * 0.3;
        if (blob.x > width + blob.radius * 0.5) blob.x = -blob.radius * 0.3;
        if (blob.y < -blob.radius * 0.5) blob.y = height + blob.radius * 0.3;
        if (blob.y > height + blob.radius * 0.5) blob.y = -blob.radius * 0.3;

        // Breathe
        blob.opacity += blob.opacityDir;
        const cfg_min = blob.baseOpacity * 0.5;
        const cfg_max = blob.baseOpacity * 1.6;
        if (blob.opacity > cfg_max || blob.opacity < cfg_min) {
          blob.opacityDir *= -1;
        }

        // Draw
        const gradient = ctx!.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        const [r, g, b] = blob.color;
        gradient.addColorStop(0, `rgba(${r},${g},${b},${blob.opacity})`);
        gradient.addColorStop(0.3, `rgba(${r},${g},${b},${blob.opacity * 0.6})`);
        gradient.addColorStop(0.6, `rgba(${r},${g},${b},${blob.opacity * 0.2})`);
        gradient.addColorStop(1, 'transparent');

        ctx!.fillStyle = gradient;
        ctx!.fillRect(
          blob.x - blob.radius,
          blob.y - blob.radius,
          blob.radius * 2,
          blob.radius * 2
        );
      }

      // ── Particles ──
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        p.opacity += p.opacityDir;
        if (p.opacity > 0.6 || p.opacity < 0.08) {
          p.opacityDir *= -1;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.shadowColor = `rgba(${p.color},0.8)`;
        ctx!.shadowBlur = p.size * 6;
        ctx!.fillStyle = `rgba(${p.color},1)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    initBlobs();
    draw();

    const onResize = () => {
      resize();
      initParticles();
      initBlobs();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
