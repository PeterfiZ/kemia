import React, { useState, useEffect } from 'react';
import { ElementData } from '../data/elements';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beaker, 
  Plus, 
  Search, 
  Sparkles, 
  Check, 
  Flame, 
  ShieldAlert, 
  Gauge, 
  Lightbulb, 
  ArrowRight, 
  Clock, 
  Trash2, 
  History, 
  BookOpen,
  Info,
  ChevronDown,
  Activity,
  Award
} from 'lucide-react';

interface ReactionLabProps {
  elements: ElementData[];
  onExploreElement?: (element: ElementData) => void;
}

interface ReactionResult {
  canReact: boolean;
  equation: string;
  productName: string;
  reactionType: string;
  energy: string;
  conditions: string;
  visualDescription: string;
  safetyPrecautions: string;
  explanation: string;
  isAi?: boolean;
}

interface SavedReaction {
  id: string;
  el1: { symbol: string; name: string };
  el2: { symbol: string; name: string };
  equation: string;
  productName: string;
  timestamp: number;
}

export default function ReactionLab({ elements, onExploreElement }: ReactionLabProps) {
  const [slotA, setSlotA] = useState<ElementData | null>(null);
  const [slotB, setSlotB] = useState<ElementData | null>(null);
  const [activeSelectingSlot, setActiveSelectingSlot] = useState<'A' | 'B' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedHistory, setSavedHistory] = useState<SavedReaction[]>([]);

  const simulationSteps = [
    "Vegyértékelektronok elemzése...",
    "Kötési energiák kalkulálása...",
    "Elektronegativitás különbségek vizsgálata...",
    "AI modell előrejelzés lekérése...",
    "Rendezett kémiai egyenlet generálása..."
  ];

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('periodic_reactions_history');
    if (saved) {
      try {
        setSavedHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading history", e);
      }
    }
  }, []);

  // Save reaction history helper
  const saveToHistory = (el1: ElementData, el2: ElementData, eq: string, prod: string) => {
    const newRecord: SavedReaction = {
      id: Math.random().toString(36).substr(2, 9),
      el1: { symbol: el1.symbol, name: el1.name },
      el2: { symbol: el2.symbol, name: el2.name },
      equation: eq,
      productName: prod,
      timestamp: Date.now()
    };
    const updated = [newRecord, ...savedHistory.slice(0, 19)]; // limit to 20
    setSavedHistory(updated);
    localStorage.setItem('periodic_reactions_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSavedHistory([]);
    localStorage.removeItem('periodic_reactions_history');
  };

  // Get color for element categories
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('alkáli fém') || cat.includes('alkálifém')) return 'bg-rose-500/10 border-rose-500 text-rose-500 dark:bg-rose-500/20';
    if (cat.includes('alkáliföldfém')) return 'bg-orange-500/10 border-orange-500 text-orange-500 dark:bg-orange-500/20';
    if (cat.includes('átmenetifém')) return 'bg-amber-500/10 border-amber-500 text-amber-500 dark:bg-amber-500/20';
    if (cat.includes('lantanoida') || cat.includes('aktinoida')) return 'bg-pink-500/10 border-pink-500 text-pink-500 dark:bg-pink-500/20';
    if (cat.includes('nemfémes') || cat.includes('egyéb nemfém')) return 'bg-emerald-500/10 border-emerald-500 text-emerald-500 dark:bg-emerald-500/20';
    if (cat.includes('halogén')) return 'bg-cyan-500/10 border-cyan-500 text-cyan-500 dark:bg-cyan-500/20';
    if (cat.includes('nemesgáz')) return 'bg-purple-500/10 border-purple-500 text-purple-500 dark:bg-purple-500/20';
    if (cat.includes('szegényfém') || cat.includes('post-transition')) return 'bg-blue-500/10 border-blue-500 text-blue-500 dark:bg-blue-500/20';
    if (cat.includes('félfém')) return 'bg-yellow-500/10 border-yellow-500 text-yellow-500 dark:bg-yellow-500/20';
    return 'bg-slate-500/10 border-slate-400 text-slate-500 dark:bg-slate-500/20';
  };

  // Preset Chemical Recipes (Magical single click buttons)
  const presets = [
    { title: "Víz szintézis 💧", symbol1: "H", symbol2: "O", label: "Durranógáz reakció" },
    { title: "Konyhasó előállítás 🧂", symbol1: "Na", symbol2: "Cl", label: "Heves sósav-fém szintézis" },
    { title: "Magnézium szalag égése 🪄", symbol1: "Mg", symbol2: "O", label: "Vakító fehér oxidációs fény" },
    { title: "Faszén parázslás 🔥", symbol1: "C", symbol2: "O", label: "Energia-felszabadító égés" },
    { title: "Vasszög rozsdásodása ⛓️", symbol1: "Fe", symbol2: "O", label: "Lassú korróziós folyamat" },
    { title: "Réz szulfid szintézis 🪙", symbol1: "Cu", symbol2: "S", label: "Kén-fém egyesülés hevítésre" },
    { title: "Inert Nemesgáz teszt 🛡️", symbol1: "Ar", symbol2: "O", label: "Stabil elektronhéj próba" }
  ];

  const handleApplyPreset = (sym1: string, sym2: string) => {
    const el1 = elements.find(e => e.symbol === sym1);
    const el2 = elements.find(e => e.symbol === sym2);
    if (el1 && el2) {
      setSlotA(el1);
      setSlotB(el2);
      setResult(null);
      setError(null);
    }
  };

  const handleSimulate = async () => {
    if (!slotA || !slotB) return;
    if (slotA.number === slotB.number) {
      setError("Kérlek válassz két különböző kémiai elemet a kísérlethez!");
      return;
    }

    setIsSimulating(true);
    setResult(null);
    setError(null);
    setSimStep(0);

    // Dynamic timer-based animation steps on frontend
    const interval = setInterval(() => {
      setSimStep(prev => {
        if (prev < simulationSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 900);

    // 1. Instant check for Noble Gases
    const nobleGases = ["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"];
    const isNoble1 = nobleGases.includes(slotA.symbol);
    const isNoble2 = nobleGases.includes(slotB.symbol);

    if (isNoble1 || isNoble2) {
      const nobleGasName = isNoble1 ? slotA.name : slotB.name;
      const nobleGasSymbol = isNoble1 ? slotA.symbol : slotB.symbol;
      const inertResult: ReactionResult = {
        canReact: false,
        equation: "Nincs reakció",
        productName: "Nincs",
        reactionType: "Nincs",
        energy: "Nincs változás",
        conditions: "Nem lehetséges",
        visualDescription: "Semmi sem történik, a két anyag változatlanul egymás mellett marad.",
        safetyPrecautions: "Nincs szükség különleges óvintézkedésekre, mivel nem megy végbe reakció.",
        explanation: `A(z) ${nobleGasName} (${nobleGasSymbol}) nemesgáz, teljesen betöltött külső elektronhéjjal (stabil oktett vagy duplett szerkezet). Emiatt rendkívül stabil, kémiailag inert, és normál vagy aktiválási körülmények között sem lép reakcióba más elemekkel.`
      };
      
      setTimeout(() => {
        clearInterval(interval);
        setResult(inertResult);
        setIsSimulating(false);
      }, 3000);
      return;
    }

    // 2. Instant check for double metals
    const metals = ["alkáli fém", "alkáliföldfém", "átmenetifém", "lantanoida", "aktinoida", "félfém", "szegényfém", "alkálifém", "alkáli fémek", "alkáliföldfémek", "átmenetifémek", "post-transition metal", "transition metal", "alkali metal", "alkaline earth metal", "lanthanide", "actinide", "metalloid"];
    const cat1 = (slotA.category || "").toLowerCase();
    const cat2 = (slotB.category || "").toLowerCase();
    const isMetal1 = metals.some(m => cat1.includes(m) || cat1.includes("fém"));
    const isMetal2 = metals.some(m => cat2.includes(m) || cat2.includes("fém"));

    if (isMetal1 && isMetal2) {
      const doubleMetalResult: ReactionResult = {
        canReact: false,
        equation: "Nincs kémiai reakció",
        productName: "Nincs (Ötvözet képződhet)",
        reactionType: "Fizikai elegyedés",
        energy: "Nincs kémiai hőváltozás",
        conditions: "Magas hőmérséklet (összeolvasztás)",
        visualDescription: "Összeolvasztás után homogén szilárd oldat (ötvözet) keletkezik, de kémiai reakció és vegyületképzés nem történik.",
        safetyPrecautions: "A fémek olvasztása rendkívül magas hőmérsékleten történik, megfelelő védőfelszerelés, kesztyű és hőálló tégely szükséges.",
        explanation: "Két fématom nem lép egymással közvetlen kémiai reakcióba stabil vegyület kialakítására, mivel mindkettő kis elektronegativitású elektrondonor. Ehelyett magas hőmérsékleten összeolvasztva fémes kötéssel összetartott szilárd oldatot, azaz ötvözetet képezhetnek."
      };

      setTimeout(() => {
        clearInterval(interval);
        setResult(doubleMetalResult);
        setIsSimulating(false);
      }, 3000);
      return;
    }

    // Common Fallback Reactions Database
    const FALLBACK_REACTIONS: Record<string, any> = {
      "H_O": {
        canReact: true,
        equation: "2 H₂ + O₂ → 2 H₂O",
        productName: "Víz (H₂O)",
        reactionType: "Egyesülés, redoxi (égés)",
        energy: "Erősen exoterm (hőtermelő, durranógáz robbanás)",
        conditions: "Szikra, láng, magas hőmérséklet vagy katalizátor (pl. platina)",
        visualDescription: "Heves durranással vagy robbanással kísért égés, a keletkező vízgőz lecsapódik az edény falára.",
        safetyPrecautions: "Védőszemüveg, fülvédő kötelező! Csak kis mennyiségben végezhető el.",
        explanation: "A hidrogénnek 1 vegyértékelektronja van, az oxigénnek 6. Két hidrogénatom megosztja elektronjait egy oxigénatommal, így stabil kovalens kötéseket alakítanak ki, elérve a nemesgáz-szerkezetet (H: duplett, O: oktett)."
      },
      "Cl_Na": {
        canReact: true,
        equation: "2 Na + Cl₂ → 2 NaCl",
        productName: "Nátrium-klorid (konyhasó)",
        reactionType: "Egyesülés, redoxi (ionos reakció)",
        energy: "Erősen exoterm (hőtermelő)",
        conditions: "Enyhe melegítés vagy vízcsepp hozzáadása katalizátorként.",
        visualDescription: "A nátrium fém vakító sárga lánggal ég a sárgászöld klórgázban, miközben sűrű fehér füst (finom sókristályok) keletkezik.",
        safetyPrecautions: "Kihúzó fülke alatt végzendő! A klórgáz erősen mérgező, a nátrium hevesen reaktív.",
        explanation: "A nátrium könnyen leadja 1 külső elektronját (így Na⁺ ionná válik), amelyet a nagy elektronegativitású klóratom felvesz (Cl⁻ ionná alakulva). Az ellentétes töltésű ionok között erős elektrosztatikus vonzás (ionos kötés) jön létre."
      },
      "Mg_O": {
        canReact: true,
        equation: "2 Mg + O₂ → 2 MgO",
        productName: "Magnézium-oxid",
        reactionType: "Egyesülés, redoxi (égés)",
        energy: "Erősen exoterm (hőtermelő)",
        conditions: "Kezdeti láng / gyújtás szükséges.",
        visualDescription: "A magnéziumszalag vakító, intenzív fehér fénnyel ég el, miközben fehér por (magnézium-oxid) keletkezik.",
        safetyPrecautions: "Tilos közvetlenül a fénybe nézni (UV-sugárzás, látáskárosodást okozhat)! Használj sötét védőszemüveget.",
        explanation: "A magnézium leadja 2 külső vegyértékelektronját az oxigénnek, így Mg²⁺ és O²⁻ ionok keletkeznek, melyek egy stabil, magas olvadáspontú ionrácsos oxidot alkotnak."
      },
      "C_O": {
        canReact: true,
        equation: "C + O₂ → CO₂",
        productName: "Szén-dioxid",
        reactionType: "Egyesülés, redoxi (égés)",
        energy: "Exoterm (hőtermelő)",
        conditions: "Gyulladási hőmérséklet elérése.",
        visualDescription: "A szén izzik, majd tiszta oxigénben fényes lánggal ég el, miközben láthatatlan, színtelen gáz (szén-dioxid) keletkezik.",
        safetyPrecautions: "Jól szellőző helyiségben végzendő, nehogy oxigénhiány miatt mérgező szén-monoxid keletkezzen.",
        explanation: "A szénatom 4 kovalens kötést alakít ki két oxigénatommal (mindegyikkel kettős kötést), így stabil szén-dioxid molekula jön létre, ahol mindegyik atom eléri az oktett állapotot."
      },
      "Fe_O": {
        canReact: true,
        equation: "4 Fe + 3 O₂ → 2 Fe₂O₃",
        productName: "Vas(III)-oxid (rozsda)",
        reactionType: "Egyesülés, redoxi (oxidáció / korrózió)",
        energy: "Exoterm (nagyon lassú hőtermelés)",
        conditions: "Nedvesség, víz és oxigén jelenléte (vagy magas hőmérséklet a gyors égéshez).",
        visualDescription: "Nedves környezetben lassan vörösesbarna por (rozsda) vonja be a vasat. Ha vasgyapotot hevítünk oxigénben, az szikrázva, fényesen ég.",
        safetyPrecautions: "A forró szikrák ellen védőszemüveg javasolt.",
        explanation: "A vasatomok elektront adnak át az oxigénatomoknak. Nedves környezetben ez egy elektrokémiai folyamat, melynek során hidratált vas(III)-oxidok keveréke jön létre."
      },
      "Cu_S": {
        canReact: true,
        equation: "2 Cu + S → Cu₂S",
        productName: "Réz(I)-szulfid",
        reactionType: "Egyesülés, redoxi",
        energy: "Exoterm (hőtermelő)",
        conditions: "Hevítés.",
        visualDescription: "A kénporral kevert rézpor hevítés hatására izzásba jön, és a reakció az égő kikapcsolása után is önfenntartóan végigfut. Fekete szilárd anyag keletkezik.",
        safetyPrecautions: "Kihúzó fülkében végzendő! A kén-dioxid gáz képződésének lehetősége miatt irritáló lehet.",
        explanation: "A rézatomok elektront adnak át a kénatomoknak, réz-szulfidot képezve. A kén az oxigéncsoport tagjaként hasonlóan viselkedik, de kisebb elektronegativitása miatt kevésbé heves a reakció."
      }
    };

    const customKey = localStorage.getItem('pet_chemapp_gemini_key');
    const sortedKey = [slotA.symbol, slotB.symbol].sort().join("_");

    // 3. Dual-path simulation execution
    try {
      let reactionData: ReactionResult;

      if (customKey && customKey.trim().length > 10) {
        // Direct Client-side Gemini Request via browser fetch (Perfect for GitHub Pages!)
        const prompt = `Te egy zseniális Kémia Professzor és egyetemi oktató vagy.
Kérlek elemezd ki a periódusos rendszer két elemének lehetséges közvetlen kémiai reakcióját:
- Elem 1: ${slotA.name} (${slotA.symbol}) [Rendszám: ${slotA.number}, Kategória: ${slotA.category}, Elektronok: ${slotA.electronConfig}]
- Elem 2: ${slotB.name} (${slotB.symbol}) [Rendszám: ${slotB.number}, Kategória: ${slotB.category}, Elektronok: ${slotB.electronConfig}]

Kérlek, határozd meg, hogy képesek-e közvetlenül reagálni egymással. Ha igen, add meg a pontos, rendezett kémiai egyenletet, a termék nevét, a reakció típusát, energetikai viszonyait (pl. exoterm/endoterm), a szükséges feltételeket, a kísérleti vizuális leírást, a biztonsági óvintézkedéseket, valamint egy részletes didaktikus magyarázatot arról, hogy miért és hogyan reagálnak az elektronszerkezetük alapján. Ha nem reagálnak (vagy rendkívül nehezen), magyarázd el ennek okát pontosan, és állítsd a 'canReact' értékét false-ra.

Fontos szabályok:
- Válaszolj szigorúan a megadott JSON formátumban!
- Minden magyarázat és leírás gyönyörű, didaktikus magyar nyelven történjen!
- A kémiai képletekben és egyenletben használj valódi alsó/felső indexeket (pl. H₂O, O₂, Na⁺).`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${customKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    canReact: { type: "BOOLEAN", description: "Képesek-e közvetlenül reakcióba lépni" },
                    equation: { type: "STRING", description: "Rendezett kémiai egyenlet, pl. 2H₂ + O₂ → 2H₂O" },
                    productName: { type: "STRING", description: "A keletkező termék(ek) neve magyarul" },
                    reactionType: { type: "STRING", description: "A reakció típusa" },
                    energy: { type: "STRING", description: "Energetikai viszonyok" },
                    conditions: { type: "STRING", description: "Reakció feltételei" },
                    visualDescription: { type: "STRING", description: "Vizuális kísérleti leírás" },
                    safetyPrecautions: { type: "STRING", description: "Biztonsági előírások" },
                    explanation: { type: "STRING", description: "Részletes magyar magyarázat" }
                  },
                  required: ["canReact", "equation", "productName", "reactionType", "energy", "conditions", "visualDescription", "safetyPrecautions", "explanation"]
                }
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error("Hiba történt a közvetlen Gemini API hívás során.");
        }

        const rawJson = await response.json();
        const textResponse = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textResponse) {
          throw new Error("A Gemini API nem küldött érvényes választ.");
        }

        const parsed = JSON.parse(textResponse);
        reactionData = {
          ...parsed,
          isAi: true
        };

      } else {
        // Fallback to Server API proxy (Express backend in workspace)
        const response = await fetch("/api/simulate-reaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ element1: slotA, element2: slotB })
        });

        if (!response.ok) {
          // If we are on static GitHub Pages, the server call will fail.
          // In that case, let's gracefully load from our local fallback dictionary or prompt
          if (FALLBACK_REACTIONS[sortedKey]) {
            reactionData = {
              isAi: false,
              ...FALLBACK_REACTIONS[sortedKey]
            };
          } else {
            reactionData = {
              canReact: true,
              equation: `${slotA.symbol} + ${slotB.symbol} → [Vegyület]`,
              productName: `${slotA.name}-${slotB.name} vegyület`,
              reactionType: "Egyesülés",
              energy: "Exoterm vagy endoterm hőváltozás",
              conditions: "Magas hőmérséklet vagy katalizátor szükséges",
              visualDescription: "A reakció során fizikai és kémiai változások történhetnek.",
              safetyPrecautions: "Használj védőszemüveget és kesztyűt a kísérlet során!",
              explanation: `A szerver oldali AI kapcsolat jelenleg nem érhető el (nincs beállítva GEMINI_API_KEY környezeti változó).\n\nÁllítsd be a GEMINI_API_KEY változót a Vercel projekt beállításaiban, vagy kattints a bal alsó sarokban lévő 🔑 (Kulcs) ikonra saját kulcs megadásához!`
            };
          }
        } else {
          reactionData = await response.json();
        }
      }

      // Complete simulation step with a pleasant delay
      setTimeout(() => {
        clearInterval(interval);
        setResult(reactionData);
        setIsSimulating(false);
        if (reactionData.canReact) {
          saveToHistory(slotA, slotB, reactionData.equation, reactionData.productName);
        }
      }, 4200);

    } catch (err: any) {
      // General error fallback using offline dictionary
      clearInterval(interval);
      if (FALLBACK_REACTIONS[sortedKey]) {
        setResult({
          isAi: false,
          ...FALLBACK_REACTIONS[sortedKey]
        });
        setIsSimulating(false);
      } else {
        setError(err.message || "Hálózati hiba történt a szimuláció során.");
        setIsSimulating(false);
      }
    }
  };

  const handleClearSlots = () => {
    setSlotA(null);
    setSlotB(null);
    setResult(null);
    setError(null);
  };

  const handleSelectPresetHistory = (h: SavedReaction) => {
    const el1 = elements.find(e => e.symbol === h.el1.symbol);
    const el2 = elements.find(e => e.symbol === h.el2.symbol);
    if (el1 && el2) {
      setSlotA(el1);
      setSlotB(el2);
      setResult(null);
      setError(null);
    }
  };

  // Filtering elements for selection lists
  const filteredElements = elements.filter(el => {
    const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          el.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          el.number.toString() === searchQuery;
    if (filterCategory === 'all') return matchesSearch;
    return matchesSearch && el.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  const categories = [
    { value: 'all', label: 'Összes kategória' },
    { value: 'alkáli', label: 'Alkálifémek' },
    { value: 'alkáliföld', label: 'Alkáliföldfémek' },
    { value: 'átmeneti', label: 'Átmenetifémek' },
    { value: 'félfém', label: 'Félfémek' },
    { value: 'nemfém', label: 'Nemfémek' },
    { value: 'halogén', label: 'Halogének' },
    { value: 'nemesgáz', label: 'Nemesgázok' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in" id="reaction_lab_container">
      
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#0c0f17] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/30 text-blue-500 dark:text-blue-400">
            <Beaker className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Kémiai Reakció Kísérleti Laboratórium
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Szimulálj kémiai reakciókat tetszőleges elemek között! Válaszd ki az anyagaidat, s nézd meg a fejlett AI előrejelzéseket.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-[10px] rounded-lg text-blue-500 dark:text-blue-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 3.5-Flash Predikció
          </span>
          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] rounded-lg text-emerald-500 dark:text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Magyar didaktika
          </span>
        </div>
      </div>

      {/* QUICK PRESETS RECIPES BAR */}
      <div className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
        <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Népszerű Kísérleti Receptek (Gyorsbetöltés)
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p.symbol1, p.symbol2)}
              className="px-3 py-2 bg-white dark:bg-[#0b0e16] hover:bg-slate-100 dark:hover:bg-[#121824] border border-slate-200 dark:border-slate-800/80 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-center min-w-[140px] shadow-sm group"
            >
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {p.title}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold mt-0.5">
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* REACTION MIXER STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* MIXING WORKSPACE (SLOTS) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0c0f17] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

          {/* Slots visual layout */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 relative z-10">
            
            {/* SLOT A CARD */}
            <div className="w-full max-w-[220px] flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">1. Reagens (Elem A)</span>
              {slotA ? (
                <div className={`w-full p-5 rounded-2xl border-2 shadow-lg flex flex-col items-center justify-center relative min-h-[220px] ${getCategoryColor(slotA.category)} transition-all duration-300 hover:shadow-xl`}>
                  <button 
                    onClick={() => setSlotA(null)} 
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                    title="Elem eltávolítása"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 tracking-widest">{slotA.number}</span>
                  <span className="text-5xl font-black my-2 font-mono tracking-tighter text-slate-800 dark:text-slate-100">{slotA.symbol}</span>
                  <span className="text-sm font-black text-slate-850 dark:text-slate-150">{slotA.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 text-center mt-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/50 uppercase tracking-wider">{slotA.category}</span>
                  <span className="text-[10px] font-mono mt-2 text-slate-500 tracking-tight">{slotA.electronConfig}</span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveSelectingSlot('A')}
                  className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-850 hover:border-blue-500 dark:hover:border-blue-500/80 bg-slate-50/50 dark:bg-[#07090e]/40 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 min-h-[220px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
                >
                  <div className="p-3 bg-slate-200/50 dark:bg-slate-900 rounded-full group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all text-slate-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Elem kiválasztása</span>
                </button>
              )}
            </div>

            {/* "+" SEPARATOR AND CONNECTING LINES */}
            <div className="flex flex-col items-center justify-center">
              {isSimulating ? (
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500"
                  />
                  <Beaker className="w-6 h-6 text-blue-500 animate-bounce" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner">
                  <Plus className="w-5 h-5 text-slate-400 dark:text-slate-550" />
                </div>
              )}
            </div>

            {/* SLOT B CARD */}
            <div className="w-full max-w-[220px] flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">2. Reagens (Elem B)</span>
              {slotB ? (
                <div className={`w-full p-5 rounded-2xl border-2 shadow-lg flex flex-col items-center justify-center relative min-h-[220px] ${getCategoryColor(slotB.category)} transition-all duration-300 hover:shadow-xl`}>
                  <button 
                    onClick={() => setSlotB(null)} 
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                    title="Elem eltávolítása"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 tracking-widest">{slotB.number}</span>
                  <span className="text-5xl font-black my-2 font-mono tracking-tighter text-slate-800 dark:text-slate-100">{slotB.symbol}</span>
                  <span className="text-sm font-black text-slate-850 dark:text-slate-150">{slotB.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 text-center mt-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/50 uppercase tracking-wider">{slotB.category}</span>
                  <span className="text-[10px] font-mono mt-2 text-slate-500 tracking-tight">{slotB.electronConfig}</span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveSelectingSlot('B')}
                  className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-855 hover:border-blue-500 dark:hover:border-blue-500/80 bg-slate-50/50 dark:bg-[#07090e]/40 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 min-h-[220px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
                >
                  <div className="p-3 bg-slate-200/50 dark:bg-slate-900 rounded-full group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all text-slate-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Elem kiválasztása</span>
                </button>
              )}
            </div>

          </div>

          {/* SIMULATION ERROR MESSAGE */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/35 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2 mt-4">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SIMULATOR TRIGGER / RESET CONTROLS */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-850 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <button
              onClick={handleClearSlots}
              disabled={!slotA && !slotB}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tégely kiürítése
            </button>

            <button
              onClick={handleSimulate}
              disabled={!slotA || !slotB || isSimulating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-900 dark:disabled:to-slate-900 disabled:opacity-50 text-white rounded-xl text-sm font-black shadow-[0_0_20px_rgba(37,99,235,0.25)] flex items-center gap-2 cursor-pointer border-0 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Kalkuláció folyamatban...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Kémiai Reakció Szimulálása ⚡</span>
                </>
              )}
            </button>
          </div>

          {/* SIMULATION STEP ANIMATED OVERLAY */}
          <AnimatePresence>
            {isSimulating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#f8fafc]/95 dark:bg-[#06080d]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8 text-center"
              >
                {/* Immersive Bubbling Beaker animation */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 border-4 border-slate-400 dark:border-slate-600 rounded-2xl flex items-end justify-center overflow-hidden p-1 relative shadow-inner">
                    <motion.div 
                      initial={{ height: "10%" }}
                      animate={{ height: "65%" }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-full bg-blue-500/30 dark:bg-blue-500/40 rounded-b-lg flex flex-col justify-end"
                    />
                    
                    {/* Bubbling dots inside beaker */}
                    <div className="absolute inset-0 flex justify-around items-end pb-4 pointer-events-none">
                      {[1, 2, 3, 4, 5].map((bubble) => (
                        <motion.div
                          key={bubble}
                          animate={{ 
                            y: [0, -70], 
                            x: [0, (bubble % 2 === 0 ? 6 : -6)],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5 + (bubble * 0.2), 
                            ease: "easeOut",
                            delay: bubble * 0.3
                          }}
                          className="w-2 h-2 rounded-full bg-blue-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Kísérleti folyamat szimulációja</h4>
                <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>

                <div className="h-6 mt-4 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={simStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-extrabold tracking-wide uppercase"
                    >
                      {simulationSteps[simStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* SIDE HISTORY BAR & STATS */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0c0f17] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4 mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              Saját Kísérleti Napló
            </h3>
            {savedHistory.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-[10px] text-rose-500 hover:text-rose-400 font-extrabold uppercase cursor-pointer tracking-wider"
              >
                Kiürít
              </button>
            )}
          </div>

          {savedHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 my-auto">
              <Beaker className="w-10 h-10 stroke-[1.5] mb-2.5" />
              <p className="text-xs font-bold leading-relaxed">Még nincsenek sikeres szimulációid.</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">Az elvégzett sikeres reakciók egyenletei automatikusan ide mentődnek a helyi naplódba!</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
              {savedHistory.map((h) => (
                <div 
                  key={h.id}
                  onClick={() => handleSelectPresetHistory(h)}
                  className="p-3 bg-slate-50 dark:bg-[#080b11] border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-500/40 cursor-pointer transition-all hover:translate-x-1 group"
                >
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                    <span>{h.el1.symbol} + {h.el2.symbol} reakció</span>
                    <span>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 tracking-tight group-hover:text-blue-500 truncate">
                    {h.equation}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    Termék: <strong className="font-extrabold">{h.productName}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick chemistry quote panel */}
          <div className="mt-auto pt-6 border-t border-slate-150 dark:border-slate-850/80">
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Kémia Tanár Tipp</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                  Az anyagszerkezet elmélete szerint a reakcióképességet döntően a legkülső héj vegyértékelektronjai határozzák meg. Az atomok az úgynevezett <strong>oktett-szabály</strong> szerint teljes, 8 elektronos nemesgáz héj elérésére törekednek ionos vagy kovalens kötésekkel!
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED RESULTS DASHBOARD */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="bg-white dark:bg-[#0c0f17] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden"
            id="reaction_result_panel"
          >
            {/* Header Result strip */}
            <div className={`px-6 py-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-white ${
              result.canReact 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-950/80 dark:to-teal-900/80 border-emerald-500/20' 
                : 'bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-900 dark:to-slate-950 border-slate-700/50'
            }`}>
              <div className="flex items-center gap-2.5">
                <Beaker className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">Szimulációs eredmény</span>
              </div>

              <div className="flex items-center gap-2">
                {result.isAi ? (
                  <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-extrabold tracking-widest uppercase border border-white/25 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Valós AI generált
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-extrabold tracking-widest uppercase border border-white/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Helyi Gyorsszimuláció (Offline)
                  </span>
                )}

                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase border ${
                  result.canReact 
                    ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-100' 
                    : 'bg-rose-500/25 border-rose-400/40 text-rose-100'
                }`}>
                  {result.canReact ? "Reakcióképes ✅" : "Inert / Nincs reakció ❌"}
                </span>
              </div>
            </div>

            {/* Results Content Body */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* LARGE BALANCED EQUATION CARD */}
              <div className="bg-slate-50 dark:bg-[#07090e] border border-slate-150 dark:border-slate-850 rounded-2xl p-6 md:p-8 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-3 left-3 flex items-center gap-1 text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  <Activity className="w-3.5 h-3.5" />
                  Rendezett kémiai egyenlet
                </div>

                <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 py-3 select-all drop-shadow-sm">
                  {result.equation}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-bold">
                  <div className="px-3.5 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl">
                    Termék: <strong className="font-extrabold">{result.productName}</strong>
                  </div>
                  <div className="px-3.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl">
                    Típus: <strong className="font-extrabold">{result.reactionType}</strong>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN SUMMARY DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visuals, Energetics & Conditions */}
                <div className="space-y-4">
                  
                  {/* Energy / Energetics */}
                  <div className="p-4.5 bg-slate-50 dark:bg-[#080b11] border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl border border-amber-500/20 self-start">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Reakció energetika és hőváltozás</h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-bold leading-snug">
                        {result.energy}
                      </p>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="p-4.5 bg-slate-50 dark:bg-[#080b11] border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="p-2.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl border border-blue-500/20 self-start">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Aktiválási és indítási feltételek</h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-bold leading-snug">
                        {result.conditions}
                      </p>
                    </div>
                  </div>

                  {/* Visual Description */}
                  <div className="p-4.5 bg-slate-50 dark:bg-[#080b11] border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl border border-indigo-500/20 self-start">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Vizuális laboratóriumi jelenség</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-bold leading-normal">
                        {result.visualDescription}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Safety Precautions & Explanation */}
                <div className="space-y-4">
                  
                  {/* Safety alerts */}
                  <div className="p-4.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 dark:border-rose-500/25 rounded-2xl flex gap-3.5">
                    <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 self-start">
                      <ShieldAlert className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">⚠️ Biztonsági Előírások és Veszélyek</h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-bold leading-normal">
                        {result.safetyPrecautions}
                      </p>
                    </div>
                  </div>

                  {/* Quick didactics card */}
                  <div className="p-4.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-3.5">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl border border-emerald-500/20 self-start">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Tanulási Mérföldkő</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                        Elemezted a(z) <strong>{slotA?.name}</strong> és a(z) <strong>{slotB?.name}</strong> közötti kölcsönhatást! A kapott elektronszerkezeti összefüggések segítenek megérteni az anyagi világ stabilitását és a kémiai kötések természetét.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* BIG DETAILED EDUCATIONAL EXPLANATION PANEL */}
              <div className="border-t border-slate-200 dark:border-slate-850 pt-6 space-y-3">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                  Kémia Professzor Részletes Magyarázata (Didaktikus Elemzés)
                </h3>
                <div className="p-5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-2xl text-slate-700 dark:text-slate-300 text-xs font-semibold leading-relaxed whitespace-pre-line">
                  {result.explanation}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ELEMENT SELECTOR MODAL / DROPDOWN CONTAINER */}
      <AnimatePresence>
        {activeSelectingSlot && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between bg-slate-50 dark:bg-[#090b11]">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Elem kiválasztása a(z) <strong className="text-blue-500">Slot {activeSelectingSlot}</strong> helyre
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Keress név, vegyjel vagy rendszám alapján, majd kattints az elemre.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveSelectingSlot(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-xs font-black cursor-pointer transition-colors"
                >
                  Mégse
                </button>
              </div>

              {/* Filters & Search Input */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keress elemet (pl. Hidrogén, Na, 11)..."
                    className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250 placeholder-slate-400"
                  />
                </div>

                <div className="relative shrink-0">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black cursor-pointer focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Element Grid List */}
              <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50/50 dark:bg-[#07090f]/10 flex-1 min-h-[300px]">
                {filteredElements.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                    <Search className="w-10 h-10 stroke-[1.5] mb-2" />
                    <span className="text-xs font-bold">Nincs találat a megadott szűrésre.</span>
                  </div>
                ) : (
                  filteredElements.map(el => {
                    const isAlreadySelected = (activeSelectingSlot === 'A' && slotB?.number === el.number) || 
                                              (activeSelectingSlot === 'B' && slotA?.number === el.number);
                    
                    return (
                      <button
                        key={el.number}
                        disabled={isAlreadySelected}
                        onClick={() => {
                          if (activeSelectingSlot === 'A') {
                            setSlotA(el);
                          } else {
                            setSlotB(el);
                          }
                          setActiveSelectingSlot(null);
                          setResult(null);
                          setError(null);
                          setSearchQuery('');
                          setFilterCategory('all');
                        }}
                        className={`p-3 border rounded-xl text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                          isAlreadySelected 
                            ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-100 dark:bg-slate-900' 
                            : 'cursor-pointer hover:scale-[1.03] hover:shadow-md border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c0f17] hover:border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] text-slate-400 font-bold">#{el.number}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-extrabold uppercase scale-90 origin-right truncate max-w-[65px]">{el.category}</span>
                        </div>
                        <div className="text-xl font-mono font-black text-slate-850 dark:text-slate-100 mt-1">{el.symbol}</div>
                        <div className="text-[10px] font-black text-slate-700 dark:text-slate-350 truncate w-full mt-0.5">{el.name}</div>
                      </button>
                    );
                  })
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
