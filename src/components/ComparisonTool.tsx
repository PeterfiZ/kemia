import React from 'react';
import { ElementData } from '../data/elements';
import { CATEGORY_MAP } from './PeriodicTable';
import { BarChart3, RefreshCw, X, HelpCircle, Layers, Wind } from 'lucide-react';

interface ComparisonToolProps {
  selectedElements: ElementData[];
  onRemoveElement: (element: ElementData) => void;
  onClear: () => void;
}

export default function ComparisonTool({ selectedElements, onRemoveElement, onClear }: ComparisonToolProps) {
  if (selectedElements.length === 0) {
    return (
      <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/85 p-10 text-center shadow-2xl relative overflow-hidden transition-colors duration-300" id="ures-osszehasonlito">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <HelpCircle className="mx-auto text-blue-500 mb-4 animate-bounce" size={44} />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 font-display">Összehasonlító Stúdió</h3>
        <p className="text-sm text-slate-650 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Kapcsold be az <strong className="text-blue-600 dark:text-blue-400 font-bold">Összehasonlítás</strong> gombot a periódusos rendszer felett, majd jelölj ki legalább 2 elemet a rácsban a grafikus és szerkezeti összevetésükhöz!
        </p>
      </div>
    );
  }

  // Helper properties extractors
  const getSafeVal = (val: number | null): number => val === null ? 0 : val;

  // Compute maximums for comparison graph scales
  const maxRadius = Math.max(...selectedElements.map(e => getSafeVal(e.atomicRadius)), 50);
  const maxElectronegativity = Math.max(...selectedElements.map(e => getSafeVal(e.electronegativity)), 3.0);
  const maxDensity = Math.max(...selectedElements.map(e => getSafeVal(e.density)), 1.0);
  const maxMelting = Math.max(...selectedElements.map(e => Math.abs(getSafeVal(e.meltingPoint))), 100);

  return (
    <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-8 shadow-xl relative overflow-hidden transition-colors duration-300" id="osszehasonlito-panel">
      {/* Background glow ambient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Tool header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800/80 gap-4 mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 font-display">
            <BarChart3 className="text-blue-500" />
            Vegyületek és Elemek Összehasonlítása
          </h2>
          <p className="text-xs text-slate-500 mt-1">Interaktív adateloszlási grafikonok és atomsugarak vizualizálása ({selectedElements.length} kijelölve)</p>
        </div>
        
        {selectedElements.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs font-bold text-rose-600 dark:text-rose-450 hover:text-white hover:bg-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-950/60 transition-all flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-transparent"
          >
            <RefreshCw size={12} />
            Mindent töröl
          </button>
        )}
      </div>

      {/* Selected Element Pill labels */}
      <div className="flex flex-wrap gap-2 mb-6 relative z-10">
        {selectedElements.map(el => {
          const catConf = CATEGORY_MAP[el.category];
          return (
            <div 
              key={el.number}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070912]/80 hover:border-slate-350 dark:hover:border-slate-700 transition`}
            >
              <span className={`font-mono text-xs font-black ${catConf.text}`}>{el.symbol}</span>
              <span className="text-xs font-bold text-slate-650 dark:text-slate-350">{el.name}</span>
              <button 
                onClick={() => onRemoveElement(el)}
                className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-500 rounded p-0.5 cursor-pointer"
                title="Eltávolítás"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Numerical and graphical parameters stack */}
      <div className="space-y-6 relative z-10">
        
        {/* Metric 1: Pauling Electronegativity */}
        <div className="p-4 bg-slate-50 dark:bg-[#070910]/75 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg transition-colors duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Elektronegativitás (Pauling-skála)</h3>
          <div className="space-y-3.5">
            {selectedElements.map(el => {
              const val = el.electronegativity;
              const percent = val ? (val / maxElectronegativity) * 100 : 0;
              const catTheme = CATEGORY_MAP[el.category];
              return (
                <div key={el.number} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{el.name} ({el.symbol})</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{val !== null ? `${val} χ` : 'adat hiányzik'}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${catTheme.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric 2: Atomic Radius visual balls comparison */}
        <div className="p-4 bg-slate-50 dark:bg-[#070910]/75 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg transition-colors duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Atomsugár méretarányos diagram (pm)</h3>
          <div className="flex flex-wrap justify-around items-end gap-6 py-4">
            {selectedElements.map(el => {
              const radius = el.atomicRadius || 40;
              // Normalize display scale between 28px and 90px
              const size = Math.max(28, (radius / maxRadius) * 90);
              const catTheme = CATEGORY_MAP[el.category];
              return (
                <div key={el.number} className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center h-24">
                    {/* Size capsule representing proportional dimensions */}
                    <div 
                      className={`rounded-full ${catTheme.bg} border-2 ${catTheme.border} opacity-80 flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]`}
                      style={{ width: `${size}px`, height: `${size}px` }}
                    >
                      <span className={`font-mono font-bold text-[10px] ${catTheme.text}`}>{el.symbol}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{el.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">{el.atomicRadius ? `${el.atomicRadius} pm` : 'Nincs adat'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric 3: Density comparison */}
        <div className="p-4 bg-slate-50 dark:bg-[#070910]/75 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg transition-colors duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Sűrűség összevetés (g/cm³)</h3>
          <div className="space-y-3.5">
            {selectedElements.map(el => {
              const val = el.density;
              const percent = val ? (val / maxDensity) * 100 : 0;
              const catTheme = CATEGORY_MAP[el.category];
              return (
                <div key={el.number} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{el.name} ({el.symbol})</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{val !== null ? `${val} g/cm³` : 'Nincs adat'}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${catTheme.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric 4: Phase changes (Melting/Boiling Points) */}
        <div className="p-4 bg-slate-50 dark:bg-[#070910]/75 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg transition-colors duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Halmazállapot-változási pontok (°C)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedElements.map(el => {
              const catTheme = CATEGORY_MAP[el.category];
              return (
                <div key={el.number} className="bg-white dark:bg-[#05070a]/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${catTheme.color}`} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{el.name} ({el.symbol})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div className="bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                      <span className="text-rose-500 dark:text-rose-400 font-bold block">Olvadáspont</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">{el.meltingPoint !== null ? `${el.meltingPoint} °C` : 'Nincs adat'}</strong>
                    </div>
                    <div className="bg-sky-500/5 p-2 rounded-lg border border-sky-500/10">
                      <span className="text-sky-500 dark:text-sky-400 font-bold block">Forráspont</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">{el.boilingPoint !== null ? `${el.boilingPoint} °C` : 'Nincs adat'}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
