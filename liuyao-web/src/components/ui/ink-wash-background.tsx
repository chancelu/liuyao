'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-screen ink wash background with floating golden particles.
 * Uses Canvas for smooth animation performance.
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
    const PARTICLE_COUNT = 60;

    // ── Ink wash blobs ──
    interface InkBlob {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      opacityDir: number;
      speed: number;
      angle: number;
      color: [number, number, number];
    }

    const blobs: InkBlob[] = [];
    const BLOB_COUNT = 5;

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
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.1, // slight upward drift
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          opacityDir: (Math.random() - 0.5) * 0.005,
          color: Math.random() > 0.15
            ? '196,149,107' // gold
            : '139,58,58',  // cinnabar (rare)
        });
      }
    }

    function initBlobs() {
      blobs.length = 0;
      const colors: [number, number, number][] = [
        [196, 149, 107], // gold
        [196, 149, 107],
        [196, 149, 107],
        [139, 58, 58],   // cinnabar
        [160, 130, 90],  // muted gold
      ];
      for (let i = 0; i < BLOB_COUNT; i++) {
        blobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 300 + 200,
          opacity: Math.random() * 0.04 + 0.02,
          opacityDir: (Math.random() - 0.5) * 0.0003,
          speed: Math.random() * 0.15 + 0.05,
          angle: Math.random() * Math.PI * 2,
          color: colors[i % colors.length],
        });
      }
    }

    function draw() {
      // Clear with deep warm black
      ctx!.fillStyle = '#0D0B08';
      ctx!.fillRect(0, 0, width, height);

      // ── Draw ink wash blobs ──
      for (const blob of blobs) {
        // Move slowly
        blob.x += Math.cos(blob.angle) * blob.speed;
        blob.y += Math.sin(blob.angle) * blob.speed;
        blob.angle += (Math.random() - 0.5) * 0.01;

        // Wrap around
        if (blob.x < -blob.radius) blob.x = width + blob.radius;
        if (blob.x > width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = height + blob.radius;
        if (blob.y > height + blob.radius) blob.y = -blob.radius;

        // Breathe opacity
        blob.opacity += blob.opacityDir;
        if (blob.opacity > 0.07 || blob.opacity < 0.015) {
          blob.opacityDir *= -1;
        }

        // Draw radial gradient blob
        const gradient = ctx!.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        const [r, g, b] = blob.color;
        gradient.addColorStop(0, `rgba(${r},${g},${b},${blob.opacity})`);
        gradient.addColorStop(0.5, `rgba(${r},${g},${b},${blob.opacity * 0.4})`);
        gradient.addColorStop(1, 'transparent');

        ctx!.fillStyle = gradient;
        ctx!.fillRect(
          blob.x - blob.radius,
          blob.y - blob.radius,
          blob.radius * 2,
          blob.radius * 2
        );
      }

      // ── Draw particles ──
      for (const p of particles) {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Breathe
        p.opacity += p.opacityDir;
        if (p.opacity > 0.5 || p.opacity < 0.05) {
          p.opacityDir *= -1;
        }

        // Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw with glow
        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.shadowColor = `rgba(${p.color},0.6)`;
        ctx!.shadowBlur = p.size * 4;
        ctx!.fillStyle = `rgba(${p.color},${p.opacity})`;
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

    window.addEventListener('resize', () => {
      resize();
      initParticles();
      initBlobs();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 1 }}
    />
  );
}
