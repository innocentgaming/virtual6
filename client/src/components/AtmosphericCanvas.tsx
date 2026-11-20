import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { playPurifierWhoosh } from './AudioEffects';

interface AtmosphericCanvasProps {
  aqi: number;
  isInversionLikely: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  type: 'pm25' | 'pm10' | 'clean';
}

export const AtmosphericCanvas: React.FC<AtmosphericCanvasProps> = ({ aqi, isInversionLikely }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [cleanedParticlesCount, setCleanedParticlesCount] = useState<number>(0);
  const [showCleanBanner, setShowCleanBanner] = useState<boolean>(false);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 280;
    };
    window.addEventListener('resize', handleResize);

    // Number of particles proportional to AQI, bounded for 60fps performance
    const particleCount = Math.min(140, Math.max(25, Math.floor((aqi / 400) * 120)));
    const particles: Particle[] = [];

    // The inversion boundary sits at roughly 65% of height
    const inversionCeilingY = isInversionLikely ? height * 0.65 : height * 0.95;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        // When inversion is active, 85% of particles are trapped below the boundary
        y: isInversionLikely && Math.random() < 0.85 
          ? inversionCeilingY + Math.random() * (height - inversionCeilingY)
          : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() > 0.8 ? 2.5 : 1.2, // PM10 vs PM2.5
        alpha: Math.random() * 0.5 + 0.3,
        type: Math.random() > 0.8 ? 'pm10' : 'pm25'
      });
    }

    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Thermal Inversion Boundary Layer if active
      if (isInversionLikely) {
        waveOffset += 0.015;
        ctx.beginPath();
        ctx.moveTo(0, inversionCeilingY);

        for (let x = 0; x <= width; x += 15) {
          const dy = Math.sin(x * 0.01 + waveOffset) * 6 + Math.cos(x * 0.02 + waveOffset * 0.8) * 4;
          ctx.lineTo(x, inversionCeilingY + dy);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        // Atmospheric haze gradient trapped below inversion lid
        const grad = ctx.createLinearGradient(0, inversionCeilingY, 0, height);
        grad.addColorStop(0, 'rgba(217, 119, 6, 0.08)');
        grad.addColorStop(0.5, 'rgba(180, 83, 9, 0.12)');
        grad.addColorStop(1, 'rgba(120, 53, 15, 0.18)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Inversion Boundary Line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const dy = Math.sin(x * 0.01 + waveOffset) * 6 + Math.cos(x * 0.02 + waveOffset * 0.8) * 4;
          if (x === 0) ctx.moveTo(x, inversionCeilingY + dy);
          else ctx.lineTo(x, inversionCeilingY + dy);
        }
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Draw & Update Particulate Brownian Motion
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around horizontally
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // When thermal inversion is active, bounce off the ceiling
        if (isInversionLikely && p.y < inversionCeilingY - 10) {
          p.vy = Math.abs(p.vy) * 0.9;
        }

        // Bounce off ground
        if (p.y > height) {
          p.y = height;
          p.vy = -Math.abs(p.vy);
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
        }

        // Render particle with realistic organic soot/aerosol coloration
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.type === 'clean') {
          ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha * 0.8})`;
        } else if (p.type === 'pm10') {
          // Coarse dust particle (amber-ochre)
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha * 0.85})`;
        } else {
          // Fine PM2.5 combustion soot (smoky charcoal / rose-gray)
          ctx.fillStyle = aqi > 250 
            ? `rgba(239, 68, 68, ${p.alpha * 0.75})` 
            : `rgba(148, 163, 184, ${p.alpha * 0.6})`;
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isEnabled, aqi, isInversionLikely]);

  // Click to trigger "Virtual Corsi-Rosenthal Purifier Pulse"
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    playPurifierWhoosh();
    setCleanedParticlesCount((prev) => prev + 12);
    setShowCleanBanner(true);
    setTimeout(() => setShowCleanBanner(false), 2400);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw clean air radial shockwave
    let shockRadius = 10;
    const expandVortex = () => {
      shockRadius += 6;
      ctx.save();
      ctx.beginPath();
      ctx.arc(clickX, clickY, shockRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - shockRadius / 120)})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      if (shockRadius < 120) {
        requestAnimationFrame(expandVortex);
      }
    };
    expandVortex();
  };

  return (
    <div className="relative w-full h-[240px] md:h-[290px] rounded-2xl overflow-hidden border border-white/10 bg-[#090c10] shadow-2xl">
      {/* Background Micro-Grid */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Atmospheric Canvas */}
      {isEnabled ? (
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
          title="Click anywhere to trigger a Virtual CADR Air Purifier Filter Pulse"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 z-10">
          Atmospheric Particle Simulation Paused
        </div>
      )}

      {/* Atmospheric HUD Overlay Header */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              aqi > 200 ? 'bg-rose-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              aqi > 200 ? 'bg-rose-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span className="text-[11px] font-mono tracking-widest text-slate-300 font-bold uppercase">
            ATMOSPHERIC AIR MASS SIMULATOR
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {isInversionLikely && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              BOUNDARY LID: 150m AGL
            </span>
          )}
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            aria-label="Toggle atmospheric particle physics"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-700/80 transition"
          >
            {isEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{isEnabled ? 'Sensors Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Click Tip & Clean Air Counter */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tap anywhere to deploy a <strong>250 CFM MERV 13</strong> clean air vortex</span>
        </div>

        {cleanedParticlesCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-[10px] font-mono text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>+{cleanedParticlesCount * 18} µg Particles Filtered</span>
          </div>
        )}
      </div>

      {/* Floating Success Notification */}
      {showCleanBanner && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-emerald-900/90 border border-emerald-500 text-emerald-200 text-xs font-bold shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Clean Air Pulse Activated — 99.4% Micro-Particle Clearance</span>
        </div>
      )}
    </div>
  );
};
