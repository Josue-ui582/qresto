'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';

interface Dish3DViewerProps {
  modelType?: 'poulet_braise' | 'poisson_grille' | 'igname_pile' | 'burger' | 'alloco' | 'cocktail';
  dishName: string;
}

export const Dish3DViewer: React.FC<Dish3DViewerProps> = ({
  modelType = 'igname_pile',
  dishName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [rotationX, setRotationX] = useState<number>(20);
  const [rotationY, setRotationY] = useState<number>(0);
  const isDraggingRef = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const colorToken = (name: string) => {
      const value = styles.getPropertyValue(name).trim();
      if (!value) {
        throw new Error(`Missing design token: ${name}`);
      }
      return value;
    };
    const colors = {
      brand50: colorToken('--color-brand-50'),
      brand100: colorToken('--color-brand-100'),
      brand200: colorToken('--color-brand-200'),
      brand400: colorToken('--color-brand-400'),
      brand500: colorToken('--color-brand-500'),
      brand600: colorToken('--color-brand-600'),
      brand700: colorToken('--color-brand-700'),
      brand800: colorToken('--color-brand-800'),
      brand900: colorToken('--color-brand-900'),
      brand950: colorToken('--color-brand-950'),
      positive300: colorToken('--color-positive-accent-300'),
      positive500: colorToken('--color-positive-accent-500'),
      positive700: colorToken('--color-positive-accent-700'),
      negative500: colorToken('--color-negative-500'),
      caution400: colorToken('--color-caution-400'),
      caution600: colorToken('--color-caution-600'),
      shadow: colorToken('--qr-black-22'),
      steam: colorToken('--qr-white-25'),
      grill: colorToken('--qr-charcoal-60'),
    };

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Save context
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);

      // Auto rotation when enabled and not dragging
      if (isRotating && !isDraggingRef.current) {
        angle += 0.015;
      }

      const currentRotY = angle + (rotationY * Math.PI) / 180;
      const currentRotX = (rotationX * Math.PI) / 180;

      // Soft shadow
      ctx.beginPath();
      ctx.ellipse(0, 80, 130, 45, 0, 0, Math.PI * 2);
      ctx.fillStyle = colors.shadow;
      ctx.filter = 'blur(0.625rem)';
      ctx.fill();
      ctx.filter = 'none';

      // 3D Platter / Plate (African terracotta / artisanal ceramic)
      ctx.save();
      ctx.rotate(currentRotX * 0.3);

      // Plate base rim
      const gradPlate = ctx.createRadialGradient(0, -10, 20, 0, 0, 130);
      gradPlate.addColorStop(0, colors.brand100); // warm ivory
      gradPlate.addColorStop(0.7, colors.brand600); // terracotta gold
      gradPlate.addColorStop(1, colors.brand800); // rich rim

      ctx.beginPath();
      ctx.ellipse(0, 25, 120, 60, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradPlate;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = colors.brand900;
      ctx.stroke();

      // Inner bowl
      ctx.beginPath();
      ctx.ellipse(0, 20, 100, 48, 0, 0, Math.PI * 2);
      ctx.fillStyle = colors.brand700;
      ctx.fill();

      // Specific 3D Food Item Rendering according to modelType
      if (modelType === 'igname_pile') {
        // Pounded yam mound (smooth white/cream sphere with authentic texture)
        const yamGrad = ctx.createRadialGradient(-20, -30, 10, 0, -20, 70);
        yamGrad.addColorStop(0, colors.brand50);
        yamGrad.addColorStop(0.5, colors.brand100);
        yamGrad.addColorStop(1, colors.brand200);

        ctx.beginPath();
        ctx.ellipse(Math.sin(currentRotY) * 10 - 20, -10, 50, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = yamGrad;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.brand500;
        ctx.stroke();

        // Gombo / Seed sauce pool with okra slices & crayfish
        const sauceGrad = ctx.createRadialGradient(25, 5, 5, 25, 10, 60);
        sauceGrad.addColorStop(0, colors.positive700); // okra green
        sauceGrad.addColorStop(0.5, colors.brand700); // palm oil reddish gold
        sauceGrad.addColorStop(1, colors.brand900);

        ctx.beginPath();
        ctx.ellipse(25 + Math.cos(currentRotY) * 8, 10, 45, 25, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = sauceGrad;
        ctx.fill();

        // Okra stars & crab claw
        ctx.fillStyle = colors.positive300;
        for (let i = 0; i < 4; i++) {
          const ox = 15 + i * 10 + Math.sin(currentRotY + i) * 3;
          const oy = 5 + (i % 2) * 8;
          ctx.beginPath();
          ctx.arc(ox, oy, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Steaming aroma particles
        ctx.fillStyle = colors.steam;
        for (let s = 0; s < 3; s++) {
          const steamY = -50 - ((angle * 40 + s * 25) % 60);
          const steamX = -20 + Math.sin(angle * 3 + s) * 12;
          ctx.beginPath();
          ctx.arc(steamX, steamY, 6 + s * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (modelType === 'poulet_braise') {
        // Braised Chicken (golden-brown glazed skin with charcoal marks)
        const chickenGrad = ctx.createRadialGradient(-10, -20, 15, 0, 0, 75);
        chickenGrad.addColorStop(0, colors.brand500);
        chickenGrad.addColorStop(0.4, colors.brand700);
        chickenGrad.addColorStop(0.8, colors.brand900);
        chickenGrad.addColorStop(1, colors.brand950);

        ctx.save();
        ctx.rotate(Math.sin(currentRotY) * 0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, 65, 38, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = chickenGrad;
        ctx.fill();

        // Drumstick bone
        ctx.fillStyle = colors.brand100;
        ctx.beginPath();
        ctx.ellipse(55, -12, 14, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Charred grill stripes
        ctx.strokeStyle = colors.grill;
        ctx.lineWidth = 3;
        for (let g = -3; g <= 3; g++) {
          ctx.beginPath();
          ctx.moveTo(g * 16 - 15, -20);
          ctx.lineTo(g * 16 + 10, 20);
          ctx.stroke();
        }

        // Fresh herbs & red chili flecks
        ctx.fillStyle = colors.negative500;
        ctx.fillRect(-10, -5, 5, 4);
        ctx.fillRect(15, -12, 4, 4);
        ctx.fillStyle = colors.positive500;
        ctx.fillRect(5, 5, 4, 3);
        ctx.fillRect(-25, 0, 5, 3);
        ctx.restore();
      } else if (modelType === 'poisson_grille') {
        // Whole captain/tilapia fish with crispy scales and lemon
        const fishGrad = ctx.createLinearGradient(-70, -20, 70, 20);
        fishGrad.addColorStop(0, colors.brand800);
        fishGrad.addColorStop(0.3, colors.brand600);
        fishGrad.addColorStop(0.7, colors.brand900);
        fishGrad.addColorStop(1, colors.brand950);

        ctx.beginPath();
        ctx.ellipse(0, 5, 75, 28, 0, 0, Math.PI * 2);
        ctx.fillStyle = fishGrad;
        ctx.fill();

        // Fish tail
        ctx.beginPath();
        ctx.moveTo(70, 5);
        ctx.lineTo(95, -18);
        ctx.lineTo(95, 28);
        ctx.closePath();
        ctx.fillStyle = colors.brand700;
        ctx.fill();

        // Lemon slice
        ctx.fillStyle = colors.caution400;
        ctx.beginPath();
        ctx.arc(-20, -15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.caution600;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (modelType === 'alloco') {
        // Golden fried plantain slices pile
        for (let i = 0; i < 7; i++) {
          const px = ((i % 4) - 1.5) * 24 + Math.sin(currentRotY + i) * 5;
          const py = Math.floor(i / 4) * 18 - 10;
          const allocoGrad = ctx.createLinearGradient(px - 15, py, px + 15, py);
          allocoGrad.addColorStop(0, colors.brand600);
          allocoGrad.addColorStop(0.5, colors.brand500);
          allocoGrad.addColorStop(1, colors.brand800);

          ctx.beginPath();
          ctx.ellipse(px, py, 20, 10, (i * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = allocoGrad;
          ctx.fill();
        }
      } else {
        // Gourmet Burger with layered buns, cheddar, tomato, patty
        // Bottom bun
        ctx.fillStyle = colors.brand600;
        ctx.beginPath();
        ctx.ellipse(0, 20, 55, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patty
        ctx.fillStyle = colors.brand950;
        ctx.beginPath();
        ctx.ellipse(0, 10, 56, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Melted cheese
        ctx.fillStyle = colors.brand500;
        ctx.beginPath();
        ctx.ellipse(0, 4, 58, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lettuce / Tomato
        ctx.fillStyle = colors.positive500;
        ctx.fillRect(-45, -2, 90, 6);
        ctx.fillStyle = colors.negative500;
        ctx.fillRect(-35, -6, 70, 5);

        // Top bun
        const topBunGrad = ctx.createRadialGradient(0, -35, 10, 0, -20, 55);
        topBunGrad.addColorStop(0, colors.brand400);
        topBunGrad.addColorStop(0.7, colors.brand600);
        topBunGrad.addColorStop(1, colors.brand800);
        ctx.beginPath();
        ctx.ellipse(0, -22, 54, 25, 0, 0, Math.PI * 2);
        ctx.fillStyle = topBunGrad;
        ctx.fill();

        // Sesame seeds
        ctx.fillStyle = colors.brand100;
        for (let s = 0; s < 8; s++) {
          ctx.beginPath();
          ctx.arc(-30 + s * 8, -28 + (s % 3) * 4, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRotating, zoom, rotationX, rotationY, modelType]);

  // Touch and Mouse Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousPointerPosition.current.x;
    const deltaY = e.clientY - previousPointerPosition.current.y;

    setRotationY((prev) => prev + deltaX * 0.8);
    setRotationX((prev) => Math.max(-10, Math.min(60, prev - deltaY * 0.8)));

    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(1.6, prev - e.deltaY * 0.0015)));
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-ink-900 via-ink-850 to-ink-950 p-4 border border-ink-800 shadow-2xl overflow-hidden text-paper-white select-none">
      {/* 3D Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 backdrop-blur-md border border-brand-500/30 text-brand-300 text-xs font-semibold">
        <Icon name="cube" className="animate-spin text-brand-400" />
        <span>Vue 3D Interactive (360°)</span>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pause rotation' : 'Reprendre la rotation'}
          className={`p-2 rounded-lg backdrop-blur-md border transition-all text-xs font-medium ${
            isRotating
              ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
              : 'bg-ink-800/80 border-ink-700 text-ink-300 hover:bg-ink-700'
          }`}
        >
          <Icon name={isRotating ? 'pause' : 'play'} />
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
          title="Zoom +"
          className="p-2 rounded-lg bg-ink-800/80 hover:bg-ink-700 border border-ink-700 text-ink-300 transition-all text-xs"
        >
          <Icon name="magnifying-glass-plus" />
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          title="Zoom -"
          className="p-2 rounded-lg bg-ink-800/80 hover:bg-ink-700 border border-ink-700 text-ink-300 transition-all text-xs"
        >
          <Icon name="magnifying-glass-minus" />
        </button>

        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setRotationX(20);
            setRotationY(0);
          }}
          title="Réinitialiser"
          className="p-2 rounded-lg bg-ink-800/80 hover:bg-ink-700 border border-ink-700 text-ink-300 transition-all text-xs"
        >
          <Icon name="rotate-right" />
        </button>
      </div>

      {/* Canvas */}
      <div
        className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none py-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          className="max-w-full h-auto drop-shadow-2xl"
        />
      </div>

      {/* Instructions footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-800/80 text-[0.6875rem] text-ink-400">
        <div className="flex items-center gap-1.5">
          <Icon name="hand-pointer" className="text-brand-400" />
          <span>Glissez avec le doigt ou la souris pour tourner à 360°</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="fire" className="text-highlight-400" />
          <span>Modélisé pour : {dishName}</span>
        </div>
      </div>
    </div>
  );
};
