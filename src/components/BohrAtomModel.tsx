import React, { useState, useEffect, useRef } from 'react';
import { ElementData } from '../data/elements';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, RotateCw, Sparkles, Orbit, ToggleLeft, ToggleRight } from 'lucide-react';

interface BohrAtomModelProps {
  element: ElementData;
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const SHELL_CAPACITIES = [2, 8, 18, 32, 50, 72, 98];

export default function BohrAtomModel({ element }: BohrAtomModelProps) {
  const [time, setTime] = useState(0);
  const [hoveredShell, setHoveredShell] = useState<number | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [manualSpeed, setManualSpeed] = useState(1);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Default baseline tilt for 3D view
  const defaultTiltX = 45;
  const defaultTiltY = 30;

  // Real-time animation loop
  useEffect(() => {
    let frameId: number;
    const update = () => {
      setTime(prev => (prev + 0.015 * manualSpeed) % (Math.PI * 2));
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [manualSpeed]);

  // Mouse hover tracking for perspective tilt interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3D || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Map mouse position to degree shifts (+-18 deg)
    setMouseTilt({
      x: (y / rect.height) * -36,
      y: (x / rect.width) * 36
    });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setHoveredShell(null);
  };

  // 3D mathematical projection function
  const getProjectedPoint = (theta: number, radius: number, tiltDegX: number, tiltDegY: number) => {
    // 1. Initial 2D coordinates on the orbital circle plane
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    const z = 0;

    if (!is3D) {
      // Simple 2D perspective
      return { x: 150 + x, y: 150 + y, z: 0 };
    }

    // Convert tilt angles to radians
    const radX = (tiltDegX * Math.PI) / 180;
    const radY = (tiltDegY * Math.PI) / 180;

    // 2. Rotate around the X-axis (Pitch)
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // 3. Rotate around the Y-axis (Yaw)
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    return {
      x: 150 + x2,
      y: 150 + y1,
      z: z2 // z coordinate represents depth for 3D layering
    };
  };

  // Build orbits and depth-sorted particles list
  const activeTiltX = is3D ? (defaultTiltX + mouseTilt.x) : 0;
  const activeTiltY = is3D ? (defaultTiltY + mouseTilt.y) : 0;

  // Orbit definitions: path string and average depth
  const orbits = element.shells.map((count, sIdx) => {
    const radius = 40 + sIdx * 22;
    // Each shell gets slightly skewed inclination for multi-axis 3D atomic nest look
    const shellTiltX = is3D ? (activeTiltX + (sIdx * 15 - 15)) : 0;
    const shellTiltY = is3D ? (activeTiltY + (sIdx * 25 - 30)) : 0;

    // Generate orbit path using 64 samples
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i * 2 * Math.PI) / 64;
      points.push(getProjectedPoint(theta, radius, shellTiltX, shellTiltY));
    }
    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    return {
      index: sIdx,
      radius,
      pathD,
      shellTiltX,
      shellTiltY
    };
  });

  // Construct depth-sorted particles for true 3D spatial overlapping
  interface RenderParticle {
    type: 'nucleus' | 'electron';
    key: string;
    x: number;
    y: number;
    z: number;
    shellIdx?: number;
    electronIdx?: number;
    color?: string;
  }

  const particles: RenderParticle[] = [];

  // Add Nucleus at depth 0
  particles.push({
    type: 'nucleus',
    key: 'nucleus',
    x: 150,
    y: 150,
    z: 0
  });

  // Add all active electrons with calculated projected positions
  element.shells.forEach((count, sIdx) => {
    const orbit = orbits[sIdx];
    const direction = sIdx % 2 === 0 ? 1 : -1;
    // Inner shells spin faster
    const orbitalSpeed = 1.2 / (sIdx + 1);

    for (let eIdx = 0; eIdx < count; eIdx++) {
      const baseAngle = (eIdx * 2 * Math.PI) / count;
      const currentAngle = baseAngle + direction * orbitalSpeed * time;
      const pt = getProjectedPoint(currentAngle, orbit.radius, orbit.shellTiltX, orbit.shellTiltY);

      particles.push({
        type: 'electron',
        key: `e-${sIdx}-${eIdx}`,
        x: pt.x,
        y: pt.y,
        z: pt.z,
        shellIdx: sIdx,
        electronIdx: eIdx
      });
    }
  });

  // Sort by z-depth ascending (lowest z = further back drawn first, highest z = foreground drawn last)
  particles.sort((a, b) => a.z - b.z);

  return (
    <div 
      className="flex flex-col items-center bg-[#070910]/70 rounded-2xl border border-slate-800/60 p-5 relative overflow-hidden min-h-[460px]"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id="bohr-3d-model-panel"
    >
      {/* Decorative Title Header */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-slate-500">
        <Orbit size={12} className="text-blue-400 animate-pulse" />
        <span>3D Interaktív Bohr-Atom</span>
      </div>

      {/* Mode selectors */}
      <div className="absolute top-3 right-3 flex items-center gap-2.5 z-20">
        {/* Toggle 3D Perspective */}
        <button
          onClick={() => setIs3D(!is3D)}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0d121f]/90 border border-slate-800/80 hover:border-blue-500/50 text-[10px] font-bold text-slate-400 transition cursor-pointer"
          title={is3D ? "Váltás 2D módba" : "Váltás 3D módba"}
        >
          {is3D ? (
            <>
              <ToggleRight size={14} className="text-blue-400" />
              <span className="text-blue-400 font-extrabold">3D Nézet</span>
            </>
          ) : (
            <>
              <ToggleLeft size={14} className="text-slate-500" />
              <span>2D Nézet</span>
            </>
          )}
        </button>
      </div>

      {/* Main interactive SVG stage */}
      <div className="relative w-72 h-72 flex items-center justify-center mt-6 select-none">
        <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.05)]" viewBox="0 0 300 300">
          <defs>
            {/* Nucleus gradient glow */}
            <radialGradient id="nucleus-glow-3d" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#1d4ed8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            {/* Core sphere shading */}
            <radialGradient id="sphere-shading" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="70%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </radialGradient>
            {/* Electron shading */}
            <radialGradient id="electron-glow" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
          </defs>

          {/* BACKGROUND RENDERING PASS: Orbits & static lines */}
          <g id="orbits-group">
            {orbits.map((orbit) => {
              const isSelected = hoveredShell === orbit.index;
              const hasAnySelected = hoveredShell !== null;
              
              // Define dynamic styling based on hover state
              let opacity = 0.35;
              if (hasAnySelected) {
                opacity = isSelected ? 0.9 : 0.12;
              }

              return (
                <g key={orbit.index}>
                  {/* Invisible thick trace for easy hover detection */}
                  <path
                    d={orbit.pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredShell(orbit.index)}
                    onMouseLeave={() => setHoveredShell(null)}
                  />

                  {/* Visual Orbit Ring */}
                  <motion.path
                    d={orbit.pathD}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth={isSelected ? 1.8 : 1}
                    strokeDasharray={isSelected ? 'none' : '4,3'}
                    animate={{ opacity }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-none"
                  />

                  {/* Ambient shell glow aura when hovered */}
                  {isSelected && (
                    <motion.path
                      d={orbit.pathD}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={4.5}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.25 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* DEPTH-SORTED INTERLEAVED RENDERING PASS: Nucleus and Electrons */}
          <g id="particles-group">
            {particles.map((particle) => {
              if (particle.type === 'nucleus') {
                return (
                  <g key={particle.key} className="pointer-events-none">
                    {/* Glowing outer halo */}
                    <circle cx="150" cy="150" r="32" fill="url(#nucleus-glow-3d)" />
                    {/* Outer core border */}
                    <circle 
                      cx="150" 
                      cy="150" 
                      r="16" 
                      className="stroke-blue-400 stroke-[1.5px] fill-transparent" 
                    />
                    {/* Main nucleus ball with 3D radial gradient shading */}
                    <circle 
                      cx="150" 
                      cy="150" 
                      r="14.5" 
                      fill="url(#sphere-shading)" 
                      className="shadow-inner"
                    />
                    {/* Center symbol text */}
                    <text 
                      x="150" 
                      y="154.5" 
                      textAnchor="middle" 
                      className="fill-white font-mono text-[10px] font-black leading-none select-none tracking-tight"
                    >
                      {element.symbol}
                    </text>
                  </g>
                );
              } else {
                // Render Electron
                const sIdx = particle.shellIdx!;
                const isSelected = hoveredShell === sIdx;
                const hasAnySelected = hoveredShell !== null;

                // Adjust size and opacity based on 3D depth coordinate
                // z ranges from roughly -radius to +radius
                const relativeDepth = particle.z / 150; // -1 (far back) to +1 (foreground)
                const baseRadius = isSelected ? 5.5 : 4.0;
                // Projected visual radius based on depth (smaller in back, larger in front)
                const finalRadius = is3D ? baseRadius * (1 + relativeDepth * 0.35) : baseRadius;
                
                let opacity = 1;
                if (hasAnySelected) {
                  opacity = isSelected ? 1.0 : 0.15;
                } else {
                  // Fallback standard depth opacity to amplify 3D perspective
                  opacity = is3D ? 0.65 + (relativeDepth * 0.35) : 0.9;
                }

                return (
                  <g key={particle.key}>
                    {/* Pulsing halo ring around active hovered shell electrons */}
                    {isSelected && (
                      <circle
                        cx={particle.x}
                        cy={particle.y}
                        r={finalRadius * 2.2}
                        className="fill-cyan-500 opacity-20 animate-ping"
                      />
                    )}

                    {/* Outer soft shadow sphere glow */}
                    <circle
                      cx={particle.x}
                      cy={particle.y}
                      r={finalRadius * 1.5}
                      fill="#38bdf8"
                      className="opacity-25 blur-[1px] pointer-events-none"
                    />

                    {/* Main electron orb with radial shading */}
                    <circle
                      cx={particle.x}
                      cy={particle.y}
                      r={finalRadius}
                      fill="url(#electron-glow)"
                      stroke={isSelected ? '#ffffff' : '#070910'}
                      strokeWidth={isSelected ? 1.2 : 0.8}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredShell(sIdx)}
                      onMouseLeave={() => setHoveredShell(null)}
                      style={{ opacity }}
                    />
                  </g>
                );
              }
            })}
          </g>
        </svg>

        {/* 3D Hint overlay label */}
        {is3D && mouseTilt.x === 0 && mouseTilt.y === 0 && (
          <div className="absolute bottom-1 bg-[#090b10]/60 backdrop-blur-sm border border-slate-800/40 px-2 py-0.5 rounded-full text-[8px] font-bold text-slate-500 flex items-center gap-1 pointer-events-none select-none uppercase tracking-wider">
            <Compass size={10} className="text-blue-400 animate-spin" />
            Húzd el az egeret a forgatáshoz
          </div>
        )}
      </div>

      {/* Manual Speed Dial Panel */}
      <div className="w-full flex items-center justify-between mt-3 px-1.5 py-1.5 bg-[#090b10]/40 rounded-xl border border-slate-800/50 z-10">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <RotateCw size={10} className="text-slate-500" />
          Keringési sebesség
        </span>
        <div className="flex gap-1">
          {[0, 0.5, 1, 2].map((sp) => (
            <button
              key={sp}
              onClick={() => setManualSpeed(sp)}
              className={`px-2 py-0.5 rounded text-[9px] font-black cursor-pointer transition ${
                manualSpeed === sp
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-350 hover:border-slate-700'
              }`}
            >
              {sp === 0 ? 'Stop' : `${sp}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Interactive Shell List Legend */}
      <div className="w-full mt-4 space-y-1 z-10">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
          Atomhéjak állapota ({element.shells.length} héj)
        </span>
        
        <div className="grid grid-cols-2 gap-1.5">
          {element.shells.map((count, idx) => {
            const shellName = SHELL_NAMES[idx] || `Héj ${idx + 1}`;
            const capacity = SHELL_CAPACITIES[idx] || 2;
            const isSelected = hoveredShell === idx;
            const pct = Math.round((count / capacity) * 100);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredShell(idx)}
                onMouseLeave={() => setHoveredShell(null)}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#101422] border-blue-500/50 shadow-md shadow-blue-500/5 text-slate-200 scale-102'
                    : 'bg-[#090b10]/40 border-slate-800/40 text-slate-400 hover:border-slate-800 hover:bg-[#0d121f]/30'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] font-black ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}>
                    {shellName}
                  </span>
                  <div className="truncate">
                    <span className="text-[10px] font-extrabold block leading-tight">{shellName}-héj</span>
                    <span className="text-[9px] font-mono font-medium text-slate-500">{count} / {capacity} e⁻</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span className={`text-[9px] font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                    {pct}%
                  </span>
                  <div className="w-8 bg-slate-900 h-1 rounded-full mt-0.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-700'}`} 
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
