'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaIcon } from '../common/Icon';

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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.filter = 'blur(10px)';
      ctx.fill();
      ctx.filter = 'none';

      // 3D Platter / Plate (African terracotta / artisanal ceramic)
      ctx.save();
      ctx.rotate(currentRotX * 0.3);

      // Plate base rim
      const gradPlate = ctx.createRadialGradient(0, -10, 20, 0, 0, 130);
      gradPlate.addColorStop(0, '#fef3c7'); // warm ivory
      gradPlate.addColorStop(0.7, '#d97706'); // terracotta gold
      gradPlate.addColorStop(1, '#92400e'); // rich rim

      ctx.beginPath();
      ctx.ellipse(0, 25, 120, 60, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradPlate;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      // Inner bowl
      ctx.beginPath();
      ctx.ellipse(0, 20, 100, 48, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();

      // Specific 3D Food Item Rendering according to modelType
      if (modelType === 'igname_pile') {
        // Pounded yam mound (smooth white/cream sphere with authentic texture)
        const yamGrad = ctx.createRadialGradient(-20, -30, 10, 0, -20, 70);
        yamGrad.addColorStop(0, '#fffbeb');
        yamGrad.addColorStop(0.5, '#fef3c7');
        yamGrad.addColorStop(1, '#fde68a');

        ctx.beginPath();
        ctx.ellipse(Math.sin(currentRotY) * 10 - 20, -10, 50, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = yamGrad;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        // Gombo / Seed sauce pool with okra slices & crayfish
        const sauceGrad = ctx.createRadialGradient(25, 5, 5, 25, 10, 60);
        sauceGrad.addColorStop(0, '#15803d'); // okra green
        sauceGrad.addColorStop(0.5, '#b45309'); // palm oil reddish gold
        sauceGrad.addColorStop(1, '#78350f');

        ctx.beginPath();
        ctx.ellipse(25 + Math.cos(currentRotY) * 8, 10, 45, 25, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = sauceGrad;
        ctx.fill();

        // Okra stars & crab claw
        ctx.fillStyle = '#86efac';
        for (let i = 0; i < 4; i++) {
          const ox = 15 + i * 10 + Math.sin(currentRotY + i) * 3;
          const oy = 5 + (i % 2) * 8;
          ctx.beginPath();
          ctx.arc(ox, oy, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Steaming aroma particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
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
        chickenGrad.addColorStop(0, '#f59e0b');
        chickenGrad.addColorStop(0.4, '#b45309');
        chickenGrad.addColorStop(0.8, '#78350f');
        chickenGrad.addColorStop(1, '#451a03');

        ctx.save();
        ctx.rotate(Math.sin(currentRotY) * 0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, 65, 38, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = chickenGrad;
        ctx.fill();

        // Drumstick bone
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(55, -12, 14, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Charred grill stripes
        ctx.strokeStyle = 'rgba(30, 20, 10, 0.6)';
        ctx.lineWidth = 3;
        for (let g = -3; g <= 3; g++) {
          ctx.beginPath();
          ctx.moveTo(g * 16 - 15, -20);
          ctx.lineTo(g * 16 + 10, 20);
          ctx.stroke();
        }

        // Fresh herbs & red chili flecks
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-10, -5, 5, 4);
        ctx.fillRect(15, -12, 4, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(5, 5, 4, 3);
        ctx.fillRect(-25, 0, 5, 3);
        ctx.restore();
      } else if (modelType === 'poisson_grille') {
        // Whole captain/tilapia fish with crispy scales and lemon
        const fishGrad = ctx.createLinearGradient(-70, -20, 70, 20);
        fishGrad.addColorStop(0, '#92400e');
        fishGrad.addColorStop(0.3, '#d97706');
        fishGrad.addColorStop(0.7, '#78350f');
        fishGrad.addColorStop(1, '#451a03');

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
        ctx.fillStyle = '#b45309';
        ctx.fill();

        // Lemon slice
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-20, -15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (modelType === 'alloco') {
        // Golden fried plantain slices pile
        for (let i = 0; i < 7; i++) {
          const px = ((i % 4) - 1.5) * 24 + Math.sin(currentRotY + i) * 5;
          const py = Math.floor(i / 4) * 18 - 10;
          const allocoGrad = ctx.createLinearGradient(px - 15, py, px + 15, py);
          allocoGrad.addColorStop(0, '#d97706');
          allocoGrad.addColorStop(0.5, '#f59e0b');
          allocoGrad.addColorStop(1, '#92400e');

          ctx.beginPath();
          ctx.ellipse(px, py, 20, 10, (i * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = allocoGrad;
          ctx.fill();
        }
      } else {
        // Gourmet Burger with layered buns, cheddar, tomato, patty
        // Bottom bun
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, 20, 55, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patty
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(0, 10, 56, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Melted cheese
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, 4, 58, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lettuce / Tomato
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-45, -2, 90, 6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-35, -6, 70, 5);

        // Top bun
        const topBunGrad = ctx.createRadialGradient(0, -35, 10, 0, -20, 55);
        topBunGrad.addColorStop(0, '#fbbf24');
        topBunGrad.addColorStop(0.7, '#d97706');
        topBunGrad.addColorStop(1, '#92400e');
        ctx.beginPath();
        ctx.ellipse(0, -22, 54, 25, 0, 0, Math.PI * 2);
        ctx.fillStyle = topBunGrad;
        ctx.fill();

        // Sesame seeds
        ctx.fillStyle = '#fef3c7';
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
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 p-4 border border-stone-800 shadow-2xl overflow-hidden text-white select-none">
      {/* 3D Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold">
        <FaIcon name="fa-solid fa-cube" className="animate-spin text-amber-400" />
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
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
          }`}
        >
          <FaIcon name={isRotating ? 'fa-solid fa-pause' : 'fa-solid fa-play'} />
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
          title="Zoom +"
          className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 transition-all text-xs"
        >
          <FaIcon name="fa-solid fa-magnifying-glass-plus" />
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          title="Zoom -"
          className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 transition-all text-xs"
        >
          <FaIcon name="fa-solid fa-magnifying-glass-minus" />
        </button>

        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setRotationX(20);
            setRotationY(0);
          }}
          title="Réinitialiser"
          className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 transition-all text-xs"
        >
          <FaIcon name="fa-solid fa-rotate-right" />
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
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80 text-[11px] text-stone-400">
        <div className="flex items-center gap-1.5">
          <FaIcon name="fa-solid fa-hand-pointer" className="text-amber-400" />
          <span>Glissez avec le doigt ou la souris pour tourner à 360°</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaIcon name="fa-solid fa-fire" className="text-orange-400" />
          <span>Modélisé pour : {dishName}</span>
        </div>
      </div>
    </div>
  );
};
