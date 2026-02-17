'use client';

import { useEffect, useRef } from 'react';

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Store canvas and dimensions locally after null checks
    const canvasEl = canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const context = ctx;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationId: number;
    
    function animate() {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      
      particles.forEach((p, i) => {
        p.vy += 0.5;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        context.save();
        context.translate(p.x, p.y);
        context.rotate((p.rotation * Math.PI) / 180);
        context.fillStyle = p.color;
        context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        context.restore();

        if (p.y > canvasHeight) particles.splice(i, 1);
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}