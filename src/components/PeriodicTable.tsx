import React, { useState } from 'react';
import { ElementData } from '../data/elements';
import { Search, Compass, Layers, Wind, Eye, CheckSquare, BarChart3, RefreshCw } from 'lucide-react';

interface PeriodicTableProps {
  elements: ElementData[];
  onElementClick: (element: ElementData) => void;
  selectedElement: ElementData | null;
  viewedList: number[];
  selectedCompareElements: ElementData[];
  onToggleCompare: (element: ElementData) => void;
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
  onClearCompare: () => void;
}

// Map logical categories to beautiful Hungarian labels and accent color families based on Immersive Theme
export const CATEGORY_MAP: Record<ElementData['category'], { label: string; color: string; border: string; bg: string; text: string }> = {
  alkalifem: { label: 'Alkálifémek', color: 'bg-rose-500', border: 'border-rose-500/30 dark:border-rose-500/40', bg: 'bg-rose-500/5 dark:bg-rose-500/10 hover:bg-rose-500/20', text: 'text-rose-450 dark:text-rose-400' },
  alkalifoldfem: { label: 'Alkáliföldfémek', color: 'bg-amber-500', border: 'border-amber-500/30 dark:border-amber-500/40', bg: 'bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/20', text: 'text-amber-450 dark:text-amber-400' },
  atmenetifem: { label: 'Átmenetifémek', color: 'bg-indigo-400', border: 'border-indigo-400/30 dark:border-indigo-400/40', bg: 'bg-indigo-400/5 dark:bg-indigo-400/10 hover:bg-indigo-400/20', text: 'text-indigo-450 dark:text-indigo-400' },
  posztatmenetifem: { label: 'Poszt-átmenetifémek', color: 'bg-blue-400', border: 'border-blue-400/30 dark:border-blue-400/40', bg: 'bg-blue-400/5 dark:bg-blue-400/10 hover:bg-blue-400/20', text: 'text-blue-450 dark:text-blue-400' },
  felfem: { label: 'Félfémek', color: 'bg-teal-400', border: 'border-teal-400/30 dark:border-teal-400/40', bg: 'bg-teal-400/5 dark:bg-teal-400/10 hover:bg-teal-400/20', text: 'text-teal-450 dark:text-teal-400' },
  nemfem: { label: 'Reaktív Nemfémek', color: 'bg-emerald-400', border: 'border-emerald-400/30 dark:border-emerald-400/40', bg: 'bg-emerald-400/5 dark:bg-emerald-400/10 hover:bg-emerald-400/20', text: 'text-emerald-450 dark:text-emerald-400' },
  halogen: { label: 'Halogének', color: 'bg-orange-500', border: 'border-orange-500/30 dark:border-orange-500/40', bg: 'bg-orange-500/5 dark:bg-orange-500/10 hover:bg-orange-500/20', text: 'text-orange-450 dark:text-orange-400' },
  nemesgaz: { label: 'Nemesgázok', color: 'bg-sky-400', border: 'border-sky-400/30 dark:border-sky-400/40', bg: 'bg-sky-400/5 dark:bg-sky-400/10 hover:bg-sky-400/20', text: 'text-sky-450 dark:text-sky-400' },
  lantanoida: { label: 'Lantanoidák', color: 'bg-fuchsia-500', border: 'border-fuchsia-500/30 dark:border-fuchsia-500/40', bg: 'bg-fuchsia-500/5 dark:bg-fuchsia-500/10 hover:bg-fuchsia-500/20', text: 'text-fuchsia-450 dark:text-fuchsia-400' },
  aktinoida: { label: 'Aktinoidák', color: 'bg-violet-500', border: 'border-violet-500/30 dark:border-violet-500/40', bg: 'bg-violet-500/5 dark:bg-violet-505/10 hover:bg-violet-550/20', text: 'text-violet-450 dark:text-violet-400' }
};

export const STATE_MAP: Record<ElementData['state'], { label: string; textUrl: string }> = {
  gáz: { label: 'Gázok', textUrl: '💨' },
  folyékony: { label: 'Folyékonyak', textUrl: '💧' },
  szilárd: { label: 'Szilárdak', textUrl: '🧱' },
  mesterséges: { label: 'Mesterségesek', textUrl: '⚡' }
};

export default function PeriodicTable({
  elements,
  onElementClick,
  selectedElement,
  viewedList,
  selectedCompareElements,
  onToggleCompare,
  compareMode,
  setCompareMode,
  onClearCompare
}: PeriodicTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ElementData['category'] | 'all'>('all');
  const [activeState, setActiveState] = useState<ElementData['state'] | 'all'>('all');
  const [activeBlock, setActiveBlock] = useState<ElementData['block'] | 'all'>('all');

  // Multi-property filter implementation
  const filteredElements = elements.map(el => {
    // Check search (by name, symbol, or atomic number)
    const matchesSearch = 
      searchTerm.trim() === '' ||
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.number.toString() === searchTerm.trim();

    // Check category filter
    const matchesCategory = activeCategory === 'all' || el.category === activeCategory;

    // Check state filter
    const matchesState = activeState === 'all' || el.state === activeState;

    // Check block filter
    const matchesBlock = activeBlock === 'all' || el.block === activeBlock;

    return {
      ...el,
      dimmed: !(matchesSearch && matchesCategory && matchesState && matchesBlock)
    };
  });

  // Highlight blocks (Lanthanum/Actinium rows helpers)
  const isLanthanideHighlight = activeCategory === 'lantanoida';
  const isActinideHighlight = activeCategory === 'aktinoida';

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setActiveState('all');
    setActiveBlock('all');
  };

  return (
    <div className="bg-white/85 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-6 shadow-xl relative overflow-hidden transition-colors duration-300">
      
      {/* Abstract dynamic background glow inside table container */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Controls container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {/* Search bar */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
            <Search size={12} className="text-blue-500" />
            Keresés az elemek közt
          </label>
          <div className="relative">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Vegyjel, név vagy rendszám..."
              className="w-full bg-slate-100 dark:bg-[#0a0d14] text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800/85 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={15} />
          </div>
        </div>

        {/* Category filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
            <Layers size={12} className="text-blue-500" />
            Vegyület család / Kategória
          </label>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as any)}
            className="w-full bg-slate-100 dark:bg-[#0a0d14] text-slate-800 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800/85 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-[#0c101a] text-slate-800 dark:text-slate-300">Minden kategória</option>
            {Object.entries(CATEGORY_MAP).map(([key, value]) => (
              <option key={key} value={key} className="bg-white dark:bg-[#0c101a] text-slate-800 dark:text-slate-300">{value.label}</option>
            ))}
          </select>
        </div>

        {/* State filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
            <Wind size={12} className="text-blue-500" />
            Halmazállapot (STP)
          </label>
          <select
            value={activeState}
            onChange={(e) => setActiveState(e.target.value as any)}
            className="w-full bg-slate-100 dark:bg-[#0a0d14] text-slate-800 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800/85 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-[#0c101a] text-slate-800 dark:text-slate-300">Minden halmazállapot</option>
            {Object.entries(STATE_MAP).map(([key, value]) => (
              <option key={key} value={key} className="bg-white dark:bg-[#0c101a] text-slate-800 dark:text-slate-300">{value.textUrl} {value.label}</option>
            ))}
          </select>
        </div>

        {/* Block options / Actions */}
        <div className="flex flex-col justify-end">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) onClearCompare();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                compareMode 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#101420] dark:hover:bg-[#151c2e] border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
              }`}
              id="hasonlitas-mod-kapcsolo"
            >
              <CheckSquare size={14} className={compareMode ? "text-blue-100" : "text-slate-400 dark:text-slate-500"} />
              {compareMode ? 'Kihasonlítás (Aktív)' : 'Összehasonlítás'}
            </button>
            <button 
              onClick={resetFilters}
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#101420] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all cursor-pointer"
              title="Szűrők alaphelyzetbe"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view wrapper to guarantee horizontal swiping on small screens */}
      <div className="overflow-x-auto pb-4 pt-1 select-none scrollbar-thin scrollbar-thumb-blue-900/30 scrollbar-track-[#05070a]">
        <div className="min-w-[1024px] relative" id="peridios-tabla-racs">
          
          {/* Column indicators 1 to 18 */}
          <div className="grid gap-1.5 text-center mb-1 text-[10px] font-bold text-gray-400 dark:text-gray-600" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <div className="space-y-1.5">
            {/* Logic for rows 1 to 7 */}
            {Array.from({ length: 7 }, (_, rIndex) => {
              const rowNum = rIndex + 1;
              return (
                <div key={rowNum} className="grid gap-1.5 relative" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                  
                  {/* Period numbers on LHS */}
                  <div className="absolute right-full mr-2.5 top-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 h-full">
                    {rowNum}
                  </div>

                  {Array.from({ length: 18 }, (_, cIndex) => {
                    const colNum = cIndex + 1;
                    
                    // Specific handle for f-block placeholders at Row 6 Col 3 (La) and Row 7 Col 3 (Ac)
                    if (rowNum === 6 && colNum === 3) {
                      return (
                        <div 
                          key="lan-placeholder"
                          onClick={() => setActiveCategory(activeCategory === 'lantanoida' ? 'all' : 'lantanoida')}
                          className={`rounded-lg border px-1.5 py-2 text-center aspect-square flex flex-col items-center justify-center text-[10px] font-extrabold cursor-pointer transition ${
                            isLanthanideHighlight 
                              ? 'bg-fuchsia-400 border-fuchsia-500 text-white' 
                              : 'bg-fuchsia-50/50 dark:bg-fuchsia-950/5 border-fuchsia-100 dark:border-fuchsia-900 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-100'
                          }`}
                        >
                          <span className="text-[8px] opacity-75 font-bold">57-71</span>
                          <span className="block text-sm font-black mt-[-2px]">La-Lu</span>
                          <span className="text-[7px]">Lant.</span>
                        </div>
                      );
                    }
                    if (rowNum === 7 && colNum === 3) {
                      return (
                        <div 
                          key="act-placeholder"
                          onClick={() => setActiveCategory(activeCategory === 'aktinoida' ? 'all' : 'aktinoida')}
                          className={`rounded-lg border px-1.5 py-2 text-center aspect-square flex flex-col items-center justify-center text-[10px] font-extrabold cursor-pointer transition ${
                            isActinideHighlight 
                              ? 'bg-violet-400 border-violet-500 text-white' 
                              : 'bg-violet-50/50 dark:bg-violet-950/5 border-violet-100 dark:border-violet-900 text-violet-600 dark:text-violet-400 hover:bg-violet-100'
                          }`}
                        >
                          <span className="text-[8px] opacity-75 font-bold">89-103</span>
                          <span className="block text-sm font-black mt-[-2px]">Ac-Lr</span>
                          <span className="text-[7px]">Akt.</span>
                        </div>
                      );
                    }

                    // Look for actual element
                    const element = filteredElements.find(
                      el => el.row === rowNum && el.col === colNum
                    );

                    if (!element) {
                      return <div key={`empty-${rowNum}-${colNum}`} className="invisible aspect-square" />;
                    }

                    const theme = CATEGORY_MAP[element.category];
                    const isViewed = viewedList.includes(element.number);
                    const isSelected = selectedElement?.number === element.number;
                    const isComparing = selectedCompareElements.some(e => e.number === element.number);

                    // Card styling
                    let bgStyle = element.dimmed ? 'opacity-15 grayscale scale-95' : '';
                    let borderHighlight = '';

                    if (isSelected) {
                      borderHighlight = 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-102 border-blue-400 z-20';
                    } else if (isComparing) {
                      borderHighlight = 'ring-2 ring-purple-500 scale-102 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] z-20';
                    }

                    return (
                      <div
                        key={element.number}
                        id={`elem-${element.number}`}
                        onClick={() => {
                          if (compareMode && !element.dimmed) {
                            onToggleCompare(element);
                          } else if (!element.dimmed) {
                            onElementClick(element);
                          }
                        }}
                        className={`relative rounded-xl border ${theme.border} ${theme.bg} ${bgStyle} ${borderHighlight} p-1 text-center aspect-square flex flex-col justify-between cursor-pointer group hover:shadow-md hover:scale-[1.03] transition-all duration-200`}
                        title={element.name}
                      >
                        {/* Selected overlay checked indicator */}
                        {isComparing && (
                          <span className="absolute top-0.5 right-0.5 p-0.5 bg-purple-600 text-white text-[7px] font-black rounded-md flex items-center justify-center leading-none">
                            OK
                          </span>
                        )}

                        {/* Top corner metrics */}
                        <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold">
                          <span className="font-mono">{element.number}</span>
                          {isViewed && (
                            <span className="text-[7px] text-blue-400 font-extrabold" title="Felfedezett">👁️</span>
                          )}
                        </div>

                        {/* Element chemical symbol */}
                        <div className={`text-base font-black ${theme.text} leading-none tracking-tight`}>
                          {element.symbol}
                        </div>

                        {/* Element Hungarian name */}
                        <div className="text-[8px] font-bold text-slate-300 truncate leading-tight">
                          {element.name}
                        </div>

                        {/* Mass at bottom */}
                        <div className="text-[7px] font-mono text-slate-500 truncate leading-none">
                          {element.mass.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Spacer row to delineate Lanthanides / Actinides separate lower grid */}
            <div className="h-6 flex items-center justify-center">
              <div className="w-[85%] border-t border-dashed border-gray-100 dark:border-gray-800" />
            </div>

            {/* Logic for Lanthanides (Row 9) and Actinides (Row 10) lower shelf */}
            {[9, 10].map(rowNum => (
              <div key={rowNum} className="grid gap-1.5 relative" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                
                {/* Visual Label indicators at LH corner */}
                <div className="absolute right-[calc(100%-120px)] lg:right-full mr-2.5 top-2.5 text-[8px] font-bold text-gray-400 dark:text-gray-600 truncate uppercase tracking-wider w-[120px] text-right pointer-events-none">
                  {rowNum === 9 ? 'Lantanoidák 5d' : 'Aktinoidák 5f'}
                </div>

                {Array.from({ length: 18 }, (_, cIndex) => {
                  const colNum = cIndex + 1;

                  // Spacer columns 1 to 3 are blank in these lower shelf f-block rows
                  if (colNum < 4) {
                    return <div key={`empty-f-${rowNum}-${colNum}`} className="aspect-square invisible" />;
                  }

                  const element = filteredElements.find(
                    el => el.row === rowNum && el.col === colNum
                  );

                  if (!element) return <div key={`empty-f-${rowNum}-${colNum}`} className="aspect-square invisible" />;

                  const theme = CATEGORY_MAP[element.category];
                  const isViewed = viewedList.includes(element.number);
                  const isSelected = selectedElement?.number === element.number;
                  const isComparing = selectedCompareElements.some(e => e.number === element.number);

                  let bgStyle = element.dimmed ? 'opacity-15 grayscale scale-95' : '';
                  let borderHighlight = '';

                  if (isSelected) {
                    borderHighlight = 'ring-2 ring-blue-500 scale-102 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-20';
                  } else if (isComparing) {
                    borderHighlight = 'ring-2 ring-purple-500 scale-102 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] z-20';
                  }

                  return (
                    <div
                      key={element.number}
                      id={`elem-${element.number}`}
                      onClick={() => {
                        if (compareMode && !element.dimmed) {
                          onToggleCompare(element);
                        } else if (!element.dimmed) {
                          onElementClick(element);
                        }
                      }}
                      className={`relative rounded-xl border ${theme.border} ${theme.bg} ${bgStyle} ${borderHighlight} p-1 text-center aspect-square flex flex-col justify-between cursor-pointer group hover:shadow-md hover:scale-[1.03] transition-all duration-200`}
                      title={element.name}
                    >
                      {isComparing && (
                        <span className="absolute top-0.5 right-0.5 p-0.5 bg-purple-600 text-white text-[7px] font-black rounded-md leading-none">
                          OK
                        </span>
                      )}

                      <div className="flex justify-between items-center text-[8px] text-slate-550 font-bold">
                        <span className="font-mono">{element.number}</span>
                        {isViewed && <span className="text-[7px] text-blue-400" title="Felfedezett">👁️</span>}
                      </div>

                      <div className={`text-base font-black ${theme.text} leading-none tracking-tight`}>
                        {element.symbol}
                      </div>

                      <div className="text-[8px] font-bold text-slate-300 truncate leading-tight">
                        {element.name}
                      </div>

                      <div className="text-[7px] font-mono text-slate-550 truncate leading-none">
                        {element.mass.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Visual Legend of element families */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-2 justify-center items-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <span className="font-bold flex items-center gap-1"><Eye size={12} className="text-slate-400 dark:text-slate-500" /> Jelmagyarázat:</span>
        {Object.entries(CATEGORY_MAP).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(activeCategory === key ? 'all' : key as any)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-[#121829] transition cursor-pointer ${
              activeCategory === key ? 'bg-slate-100 dark:bg-slate-800/50 font-bold ring-1 ring-blue-500/50' : ''
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${value.color}`} />
            <span>{value.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
