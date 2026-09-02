"use client";

import React, { useEffect, useRef, useState } from "react";

interface VectorParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  baseRadius: number;
  color: string;
  vectorLength: number;
}

interface FlowVector {
  x: number;
  y: number;
  angle: number;
  baseAngle: number;
  length: number;
  alpha: number;
}

export const SportCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Seguimiento del cursor muy suave
    const mouse = {
      x: width / 2,
      y: height / 3,
      targetX: width / 2,
      targetY: height / 3,
      vx: 0,
      vy: 0,
      radius: 140,
      active: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGridVectors();
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // 1. Micro-Vectores de Fondo Ultra-Espaciados (Mínima presencia)
    let flowGrid: FlowVector[] = [];
    const gridSpacing = 180; // Muy espaciado

    const initGridVectors = () => {
      flowGrid = [];
      const cols = Math.ceil(width / gridSpacing);
      const rows = Math.ceil(height / gridSpacing);

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * gridSpacing;
          const y = r * gridSpacing;
          const baseAngle = Math.sin(x * 0.002) * Math.cos(y * 0.002) * Math.PI;
          flowGrid.push({
            x,
            y,
            angle: baseAngle,
            baseAngle,
            length: 6,
            alpha: 0.04,
          });
        }
      }
    };

    // 2. Partículas Dinámicas: Solo 12 a 15 nodos flotantes ultra-lentos
    let particles: VectorParticle[] = [];
    const particleCount = Math.min(Math.floor((width * height) / 90000), 14); // Ultra reducido (12-14 nodos)
    const emeraldColors = ["#10B981", "#059669", "#0D9488", "#34D399"];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 0.6 + 1.2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.15 + 0.10; // Ultra lento (0.10 a 0.25 px/frame)
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          speed,
          radius,
          baseRadius: radius,
          color: emeraldColors[Math.floor(Math.random() * emeraldColors.length)],
          vectorLength: Math.random() * 6 + 8,
        });
      }
    };

    initGridVectors();
    initParticles();

    // Función para dibujar flechas vectoriales discretas
    const drawVectorArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      lineWidth = 0.7,
      arrowSize = 2.4
    ) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowSize * Math.cos(angle - Math.PI / 5),
        toY - arrowSize * Math.sin(angle - Math.PI / 5)
      );
      ctx.lineTo(
        toX - arrowSize * Math.cos(angle + Math.PI / 5),
        toY - arrowSize * Math.sin(angle + Math.PI / 5)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      // Suavizado ultra suave del cursor
      mouse.vx = (mouse.targetX - mouse.x) * 0.04;
      mouse.vy = (mouse.targetY - mouse.y) * 0.04;
      mouse.x += mouse.vx;
      mouse.y += mouse.vy;

      // Limpiar lienzo con fondo degradado suave
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#FFFFFF");
      bgGrad.addColorStop(0.6, "#F8FAFC");
      bgGrad.addColorStop(1, "#F0FDF4");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Micro-Vectores de Fondo Casi Imperceptibles
      for (let i = 0; i < flowGrid.length; i++) {
        const v = flowGrid[i];
        const dx = v.x - mouse.x;
        const dy = v.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < mouse.radius) {
          const mouseAngle = Math.atan2(mouse.vy, mouse.vx);
          const influence = 1 - dist / mouse.radius;
          v.angle = v.baseAngle * (1 - influence) + mouseAngle * influence;
          v.alpha = 0.04 + influence * 0.08;
        } else {
          v.angle += (v.baseAngle - v.angle) * 0.02;
          v.alpha += (0.03 - v.alpha) * 0.02;
        }

        const endX = v.x + Math.cos(v.angle) * v.length;
        const endY = v.y + Math.sin(v.angle) * v.length;

        drawVectorArrow(v.x, v.y, endX, endY, `rgba(5, 150, 105, ${v.alpha})`, 0.6, 1.8);
      }

      // 2. Conexiones de Malla Muy Ligeras
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.10;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 3. Partículas con Flotación Ultra-Lenta
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Rebote suave en bordes
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Reacción muy gentil al cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 0.3;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.08;
          p.vy += Math.sin(angle) * force * 0.08;
        } else {
          p.vx *= 0.998;
          p.vy *= 0.998;

          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (currentSpeed < 0.08) {
            p.vx = (Math.random() - 0.5) * p.speed;
            p.vy = (Math.random() - 0.5) * p.speed;
          }
        }

        // Vector de Movimiento Sutil
        const vMagnitude = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const vLength = Math.max(p.vectorLength, vMagnitude * 10);
        const vAngle = Math.atan2(p.vy, p.vx);
        const vEndX = p.x + Math.cos(vAngle) * vLength;
        const vEndY = p.y + Math.sin(vAngle) * vLength;

        drawVectorArrow(p.x, p.y, vEndX, vEndY, `rgba(5, 150, 105, 0.25)`, 0.8, 2.4);

        // Nodo diminuto y elegante
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.45;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
