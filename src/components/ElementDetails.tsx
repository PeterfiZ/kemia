import React, { useState, useEffect } from 'react';
import { ElementData } from '../data/elements';
import { CATEGORY_MAP } from './PeriodicTable';
import { BookOpen, HelpCircle, Activity, Award, Compass, Heart, Share2, Sparkles, AlertCircle, Cpu } from 'lucide-react';
import BohrAtomModel from './BohrAtomModel';

interface ElementDetailsProps {
  element: ElementData;
  onExplore: (elementNumber: number) => void;
}

export default function ElementDetails({ element, onExplore }: ElementDetailsProps) {
  const [activeTab, setActiveTab] = useState<'didactic' | 'properties'>('didactic');
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  // Mark element as viewed by student profiles
  useEffect(() => {
    if (element) {
      onExplore(element.number);
      // Fetch dynamic explanation on element change
      fetchExplainer();
    }
  }, [element]);

  useEffect(() => {
    const handleKeyUpdate = () => {
      if (element) {
        fetchExplainer();
      }
    };
    window.addEventListener('pet_chemapp_key_updated', handleKeyUpdate);
    return () => window.removeEventListener('pet_chemapp_key_updated', handleKeyUpdate);
  }, [element]);

  // Fetch from Express / Vercel Serverless Gemini API endpoint (or direct client key if configured)
  const fetchExplainer = async () => {
    setLoading(true);
    setExplanation('');
    const customKey = localStorage.getItem('pet_chemapp_gemini_key')?.trim();

    try {
      if (customKey && customKey.length > 10) {
        const prompt = `Te egy barátságos, kiváló és nagy tudású Kémia Professzor és Tanár vagy.
Kérlek magyarázd el didaktikusan, diákok számára könnyen érthetően, de tudományosan pontosan a(z) ${element.name} (${element.symbol}) nevű elem kémiai sajátosságait!

Íme néhány alapvető adat segítségként:
- Rendszám: ${element.number}
- Periódus: ${element.period}, Csoport: ${element.group}
- Kategória: ${element.category}
- Elektronkonfiguráció: ${element.electronConfig}
- Alapvető kémiai leírás: ${element.chemicalReview}

Kérlek térj ki a következőkre a magyarázatodban:
1. **Atomi felépítés és Helyzet**: Hogyan határozza meg a periódusos rendszerben betöltött helye és a külső vegyértékhéj szerkezete a viselkedését?
2. **Reaktivitás és Kötések**: Milyen elemekkel lép szívesen reakcióba, és milyen típusú kötéseket (kovalens, ionos, fémes) alakít ki? Adj néhány konkrét példát hétköznapi vegyületeire is!
3. **Különlegességek**: Említs valami izgalmas kémiai kísérletet vagy jelenséget, ami ehhez az elemhez kapcsolódik.
4. **🧠 Memóriatrükk / Tanulási Segédlet**: Adj egy könnyű tippet vagy asszociációt, amivel a diákok azonnal megjegyezhetik az elemet és a tulajdonságait!

Válaszolj gyönyörű, strukturált magyar nyelven. Használj gazdag Markdown formázást: címsorokat (###), vastag betűket, felsorolásokat és kódblokkokat a képletekhez!`;

        const directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${customKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (directRes.ok) {
          const rawJson = await directRes.json();
          const textResponse = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            setExplanation(textResponse);
            setIsAiGenerated(true);
            return;
          }
        }
      }

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-api-key': customKey } : {})
        },
        body: JSON.stringify(element)
      });
      if (response.ok) {
        const data = await response.json();
        setExplanation(data.text);
        setIsAiGenerated(!!data.isAi);
      } else {
        throw new Error('Hiba történt a szerver kapcsolatban.');
      }
    } catch (e: any) {
      console.error(e);
      // Fail proof offline local fallback
      setExplanation(`### 🏫 Helyi Kémia Tanár (Offline Mód)\n\n**A(z) ${element.name} (${element.symbol}) tulajdonságai:**\n\n${element.chemicalReview}\n\n_Az AI magyarázat eléréséhez állíts be egy \`GEMINI_API_KEY\` környezeti változót a Vercel projektben, vagy adj meg saját kulcsot a bal alsó sarokban lévő 🔑 (Kulcs) ikonnal._`);
      setIsAiGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const theme = CATEGORY_MAP[element.category];

  // Helper parser to render Markdown didactics (### headers, sub-lists, bold) beautifully into secure JSX blocks
  const renderParsedMarkdown = (mdText: string) => {
    if (!mdText) return null;
    const lines = mdText.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('###')) {
        return (
          <h4 key={idx} className="text-base font-bold text-gray-900 dark:text-amber-300 mt-5 mb-2.5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-1">
            <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm"></span>
            {line.replace(/###\s*/, '')}
          </h4>
        );
      }
      if (line.startsWith('##')) {
        return <h3 key={idx} className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-6 mb-3">{line.replace(/##\s*/, '')}</h3>;
      }
      if (line.startsWith('#')) {
        return <h2 key={idx} className="text-xl font-black text-gray-950 dark:text-white mt-6 mb-4">{line.replace(/#\s*/, '')}</h2>;
      }

      // Blockquote warn
      if (line.startsWith('>')) {
        return (
          <div key={idx} className="bg-amber-50 dark:bg-amber-950/25 border-l-4 border-amber-500 p-3 rounded-r-xl my-4 text-xs font-medium text-amber-800 dark:text-amber-300">
            {line.replace(/^>\s*/, '')}
          </div>
        );
      }

      // Bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const cleaned = line.replace(/^[\s-*]+\s*/, '');
        return (
          <ul key={idx} className="list-disc list-inside ml-4 my-1 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            <li>{renderBoldSpans(cleaned)}</li>
          </ul>
        );
      }

      // Default line
      if (line.trim() === '') return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed my-2">
          {renderBoldSpans(line)}
        </p>
      );
    });
  };

  // Parse bold strings like **valami**
  const renderBoldSpans = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      // check if it was bold (every second item in split array)
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-gray-950 dark:text-white bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded text-xs leading-none">{part}</strong>;
      }
      // plain text, also search for inline code like `code`
      const subParts = part.split(/`([^`]+)`/g);
      return subParts.map((subPart, subIdx) => {
        if (subIdx % 2 === 1) {
          return <code key={subIdx} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xs text-rose-500 dark:text-rose-400 font-bold">{subPart}</code>;
        }
        return subPart;
      });
    });
  };

  return (
    <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-6 shadow-xl flex flex-col h-full relative overflow-hidden transition-colors duration-300" id={`details-card-${element.number}`}>
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Element Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-500/35 bg-blue-550/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]`}>
            <span className="text-[10px] font-mono font-bold text-blue-400/80 leading-none mb-1">{element.number}</span>
            <span className={`text-2xl font-black text-blue-400 leading-none`}>{element.symbol}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{element.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                {theme.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Atomsúly: <strong className="font-mono text-slate-650 dark:text-slate-350">{element.mass.toFixed(4)} u</strong> | Mező: <strong className="font-mono uppercase text-slate-650 dark:text-slate-350">{element.block}-block</strong>
            </p>
          </div>
        </div>

        {/* Explore and active parameters */}
        <div className="text-left sm:text-right">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hely a táblázatban</span>
          <span className="text-xs font-bold text-blue-400 block mt-1">
            {element.period}. periódus, {element.group === 0 ? 'Ritkaföldfém' : `${element.group}. csoport`}
          </span>
        </div>
      </div>

      {/* Main content grid: Bohr Model Left | Details Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 flex-1 relative z-10">
        
        {/* Dynamic 3D perspective Bohr Atomic Model */}
        <BohrAtomModel element={element} />

        {/* Interactive Tabs Menu: AI Explainer vs Metrics lists */}
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Tab switch buttons */}
            <div className="flex bg-slate-100 dark:bg-[#070910]/85 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-800/80 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <button
                onClick={() => setActiveTab('didactic')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-0 cursor-pointer transition-all ${
                  activeTab === 'didactic' 
                    ? 'bg-white dark:bg-[#101422] text-blue-600 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)] font-bold border border-slate-200 dark:border-slate-800/50' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                <Sparkles size={13} />
                Kémia AI Mentor
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-0 cursor-pointer transition-all ${
                  activeTab === 'properties' 
                    ? 'bg-white dark:bg-[#101422] text-blue-600 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)] font-bold border border-slate-200 dark:border-slate-800/50' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                <Activity size={13} />
                Fizikai & Kémiai Adatok
              </button>
            </div>

            {/* Tab 1: Dynamic Didactic reviews */}
            {activeTab === 'didactic' && (
              <div className="flex-1 flex flex-col max-h-[350px] overflow-y-auto pr-1 select-text">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3.5">
                    <div className="w-8 h-8 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin mr-1"></div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">Az AI Mentor elemzi a struktúrát...</p>
                  </div>
                ) : (
                  <div className="space-y-3 prose prose-invert max-w-none">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded w-max">
                      {isAiGenerated ? (
                        <>
                          <Sparkles size={11} className="text-amber-500" />
                          <span>Gemini generált magyarázat</span>
                        </>
                      ) : (
                        <>
                          <BookOpen size={11} className="text-blue-400" />
                          <span>Standard didaktikus füzet</span>
                        </>
                      )}
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm scroll-smooth" id="tanito-szoveg-tarolo">
                      {renderParsedMarkdown(explanation)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Absolute physical properties lists */}
            {activeTab === 'properties' && (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {/* Physical metrics grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-[#070910]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Vegypár vegyérték</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                      {element.valence}
                    </strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070910]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Elektronegativitás</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                      {element.electronegativity ? `${element.electronegativity} Pauling` : 'Nem értelmezhető'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070910]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Atomsugár</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                      {element.atomicRadius ? `${element.atomicRadius} pm` : 'Nincs adat'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070910]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Sűrűség</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                      {element.density ? `${element.density} g/cm³` : 'Nincs adat'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070910]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Olvadáspont</span>
                    <strong className="text-sm font-extrabold text-rose-455 mt-1 block text-rose-500 dark:text-rose-400">
                      {element.meltingPoint !== null ? `${element.meltingPoint} °C` : 'Nincs adat'}
                    </strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070910]/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Forráspont</span>
                    <strong className="text-sm font-extrabold text-sky-455 mt-1 block text-sky-500 dark:text-sky-400">
                      {element.boilingPoint !== null ? `${element.boilingPoint} °C` : 'Nincs adat'}
                    </strong>
                  </div>
                </div>

                {/* Elektronszerkezet detail */}
                <div className="bg-slate-50 dark:bg-[#070910]/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Külső elektronszerkezet</span>
                  <code className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                    {element.electronConfig}
                  </code>
                </div>

                {/* Discovery and year */}
                <div className="bg-slate-50 dark:bg-[#070910]/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Felfedezése</span>
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-bold">{element.discovery}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Details: Applications and fun fact */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs relative z-10">
        <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
          <span className="font-bold text-blue-500 dark:text-blue-450 uppercase tracking-widest text-[9px] block mb-1">💼 Ipari felhasználás</span>
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{element.uses}</p>
        </div>
        <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
          <span className="font-bold text-amber-600 dark:text-amber-450 uppercase tracking-widest text-[9px] block mb-1">💡 Érdekesség / Különlegesség</span>
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{element.fact}</p>
        </div>
      </div>

    </div>
  );
}

