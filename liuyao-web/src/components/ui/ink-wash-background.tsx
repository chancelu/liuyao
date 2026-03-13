'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-screen animated background:
 * - Static golden landscape image as base
 * - Glowing moon with breathing pulse
 * - Twinkling stars
 * - Flowing golden ink wash blobs
 * - Floating golden particles
 */
export function InkWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    // Load background image
    const img = new Image();
    img.src = '/images/bg-golden-landscape-2.png';
    img.onload = () => { imgRef.current = img; };

    // ── Stars ──
    interface Star {
      x: number; y: number;
      size: number;
      baseOpacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
    }
    const stars: Star[] = [];
    const STAR_COUNT = width < 640 ? 60 : 120;

    // ── Ink wash blobs ──
    interface InkBlob {
      x: number; y: number;
      radius: number;
      baseOpacity: number;
      opacity: number;
      opacityDir: number;
      speed: number;
      angle: number;
      color: [number, number, number];
    }
    const blobs: InkBlob[] = [];
    const BLOB_COUNT = 6;

    // ── Particles ──
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      opacity: number;
      opacityDir: number;
      color: string;
    }
    const particles: Particle[] = [];
    const PARTICLE_COUNT = width < 640 ? 25 : 50;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.6, // upper 60% only
          size: Math.random() * 1.5 + 0.3,
          baseOpacity: Math.random() * 0.4 + 0.1,
          twinkleSpeed: Math.random() * 2 + 1,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function initBlobs() {
      blobs.length = 0;
      const configs: { color: [number, number, number]; opRange: [number, number]; rRange: [number, number] }[] = [
        { color: [196, 149, 107], opRange: [0.04, 0.12], rRange: [300, 600] },
        { color: [196, 149, 107], opRange: [0.03, 0.10], rRange: [250, 500] },
        { color: [180, 140, 100], opRange: [0.03, 0.09], rRange: [200, 450] },
        { color: [196, 149, 107], opRange: [0.03, 0.08], rRange: [200, 400] },
        { color: [139, 58, 58],   opRange: [0.02, 0.05], rRange: [150, 350] },
        { color: [210, 180, 140], opRange: [0.02, 0.04], rRange: [250, 400] },
      ];
      for (let i = 0; i < BLOB_COUNT; i++) {
        const cfg = configs[i];
        const baseOp = cfg.opRange[0] + Math.random() * (cfg.opRange[1] - cfg.opRange[0]);
        blobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: cfg.rRange[0] + Math.random() * (cfg.rRange[1] - cfg.rRange[0]),
          baseOpacity: baseOp,
          opacity: baseOp,
          opacityDir: (Math.random() > 0.5 ? 1 : -1) * (0.0002 + Math.random() * 0.0003),
          speed: Math.random() * 0.08 + 0.02,
          angle: Math.random() * Math.PI * 2,
          color: cfg.color,
        });
      }
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2 - 0.05,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          opacityDir: (Math.random() - 0.5) * 0.003,
          color: Math.random() > 0.1 ? '196,149,107' : '139,58,58',
        });
      }
    }

    function drawMoon(t: number) {
      // Moon position: upper right area
      const mx = width * 0.75;
      const my = height * 0.18;
      const moonRadius = Math.min(width, height) * 0.04;

      // Breathing glow
      const breathe = 0.6 + 0.4 * Math.sin(t * 0.3);
      const glowRadius = moonRadius * (3 + breathe * 1.5);

      // Outer glow
      const outerGlow = ctx!.createRadialGradient(mx, my, moonRadius * 0.5, mx, my, glowRadius);
      outerGlow.addColorStop(0, `rgba(212,168,123,${0.06 * breathe})`);
      outerGlow.addColorStop(0.3, `rgba(196,149,107,${0.03 * breathe})`);
      outerGlow.addColorStop(1, 'transparent');
      ctx!.fillStyle = outerGlow;
      ctx!.fillRect(mx - glowRadius, my - glowRadius, glowRadius * 2, glowRadius * 2);

      // Inner glow
      const innerGlow = ctx!.createRadialGradient(mx, my, 0, mx, my, moonRadius * 1.5);
      innerGlow.addColorStop(0, `rgba(240,235,227,${0.15 * breathe})`);
      innerGlow.addColorStop(0.5, `rgba(212,168,123,${0.08 * breathe})`);
      innerGlow.addColorStop(1, 'transparent');
      ctx!.fillStyle = innerGlow;
      ctx!.fillRect(mx - moonRadius * 2, my - moonRadius * 2, moonRadius * 4, moonRadius * 4);

      // Moon body
      const moonGrad = ctx!.createRadialGradient(mx - moonRadius * 0.2, my - moonRadius * 0.2, 0, mx, my, moonRadius);
      moonGrad.addColorStop(0, `rgba(240,235,227,${0.25 * breathe})`);
      moonGrad.addColorStop(0.7, `rgba(212,168,123,${0.18 * breathe})`);
      moonGrad.addColorStop(1, `rgba(196,149,107,${0.05 * breathe})`);
      ctx!.fillStyle = moonGrad;
      ctx!.beginPath();
      ctx!.arc(mx, my, moonRadius, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawStars(t: number) {
      for (const star of stars) {
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * star.twinkleSpeed + star.twinkleOffset));
        const opacity = star.baseOpacity * twinkle;

        ctx!.save();
        ctx!.globalAlpha = opacity;
        ctx!.shadowColor = 'rgba(212,168,123,0.8)';
        ctx!.shadowBlur = star.size * 3;
        ctx!.fillStyle = 'rgba(240,235,227,1)';
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    function drawBlobs() {
      for (const blob of blobs) {
        blob.x += Math.cos(blob.angle) * blob.speed;
        blob.y += Math.sin(blob.angle) * blob.speed;
        blob.angle += (Math.random() - 0.5) * 0.006;

        if (blob.x < -blob.radius * 0.5) blob.x = width + blob.radius * 0.3;
        if (blob.x > width + blob.radius * 0.5) blob.x = -blob.radius * 0.3;
        if (blob.y < -blob.radius * 0.5) blob.y = height + blob.radius * 0.3;
        if (blob.y > height + blob.radius * 0.5) blob.y = -blob.radius * 0.3;

        blob.opacity += blob.opacityDir;
        if (blob.opacity > blob.baseOpacity * 1.5 || blob.opacity < blob.baseOpacity * 0.4) {
          blob.opacityDir *= -1;
        }

        const gradient = ctx!.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        const [r, g, b] = blob.color;
        gradient.addColorStop(0, `rgba(${r},${g},${b},${blob.opacity})`);
        gradient.addColorStop(0.4, `rgba(${r},${g},${b},${blob.opacity * 0.5})`);
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},${blob.opacity * 0.15})`);
        gradient.addColorStop(1, 'transparent');
        ctx!.fillStyle = gradient;
        ctx!.fillRect(blob.x - blob.radius, blob.y - blob.radius, blob.radius * 2, blob.radius * 2);
      }
    }

    function drawParticles() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opacityDir;
        if (p.opacity > 0.5 || p.opacity < 0.06) p.opacityDir *= -1;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.shadowColor = `rgba(${p.color},0.6)`;
        ctx!.shadowBlur = p.size * 5;
        ctx!.fillStyle = `rgba(${p.color},1)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    function draw() {
      time += 0.016; // ~60fps

      // Clear
      ctx!.fillStyle = '#0D0B08';
      ctx!.fillRect(0, 0, width, height);

      // Draw static background image (blurred, with dark overlay)
      if (imgRef.current) {
        ctx!.save();
        ctx!.filter = 'blur(3px)';
        ctx!.globalAlpha = 0.22;
        // Cover the canvas maintaining aspect ratio
        const imgW = imgRef.current.width;
        const imgH = imgRef.current.height;
        const scale = Math.max(width / imgW, height / imgH);
        const dw = imgW * scale;
        const dh = imgH * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;
        ctx!.drawImage(imgRef.current, dx, dy, dw, dh);
        ctx!.filter = 'none';
        ctx!.restore();

        // Dark overlay
        ctx!.save();
        ctx!.fillStyle = 'rgba(13,11,8,0.35)';
        ctx!.fillRect(0, 0, width, height);
        ctx!.restore();
      }

      // Animated layers
      drawBlobs();
      drawMoon(time);
      drawStars(time);
      drawParticles();

      // Bottom fade to black (for content readability)
      const bottomFade = ctx!.createLinearGradient(0, height * 0.55, 0, height);
      bottomFade.addColorStop(0, 'transparent');
      bottomFade.addColorStop(1, 'rgba(13,11,8,0.7)');
      ctx!.fillStyle = bottomFade;
      ctx!.fillRect(0, height * 0.55, width, height * 0.45);

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initStars();
    initBlobs();
    initParticles();
    draw();

    const onResize = () => {
      resize();
      initStars();
      initBlobs();
      initParticles();
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
