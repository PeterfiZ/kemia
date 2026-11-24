import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Github, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('pet_chemapp_gemini_key') || '';
      setApiKey(savedKey);
      setIsSaved(!!savedKey);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('pet_chemapp_gemini_key', apiKey.trim());
      setIsSaved(true);
      // Trigger a custom event so that components like ReactionLab know the key changed
      window.dispatchEvent(new Event('pet_chemapp_key_updated'));
      
      // Visual feedback toast or text
      setTestStatus('success');
      setTestMessage('Kulcs sikeresen mentve a böngésző biztonságos tárolójába (localStorage)!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      localStorage.removeItem('pet_chemapp_gemini_key');
      setIsSaved(false);
      window.dispatchEvent(new Event('pet_chemapp_key_updated'));
      setTestStatus('error');
      setTestMessage('A kulcs törölve lett. Mostantól az alapértelmezett szerver-kapcsolat fog működni.');
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('pet_chemapp_gemini_key');
    setIsSaved(false);
    window.dispatchEvent(new Event('pet_chemapp_key_updated'));
    setTestStatus('idle');
    setTestMessage('Kulcs törölve.');
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Kérlek adj meg egy kulcsot a teszteléshez!');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Kapcsolódás a Google Gemini API szerverekhez...');

    try {
      // Small test prompt payload to verify the key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Mondd azt hogy: OK' }] }]
          })
        }
      );

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Kapcsolat sikeres! Az API kulcsod érvényes és használatra kész.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || 'Helytelen vagy inaktív API kulcs.';
        setTestStatus('error');
        setTestMessage(`Hiba történt: ${errorMsg}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Hálózati hiba: ${err.message || err}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            id="api_key_settings_modal"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between bg-slate-50 dark:bg-[#090b11]">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Key className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Gemini API Kulcs Beállítások
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Saját böngészőbeli kulcs vagy Vercel szerveroldali környezeti változó használata
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              
              {/* Alert / explanation for Vercel & client-side key */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 text-slate-750 dark:text-slate-300">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p>
                    A program a <strong>Vercel</strong> felhőplatformon szerverless API végpontokkal (<code className="font-mono text-[10px]">/api/explain</code> és <code className="font-mono text-[10px]">/api/simulate-reaction</code>) fut. Ha a Vercel projektben be van állítva a <code className="font-mono text-[10px]">GEMINI_API_KEY</code> környezeti változó, az AI funkciók automatikusan működnek.
                  </p>
                  <p className="mt-1.5">
                    Ha mégsem állítottál be központi kulcsot, vagy saját kvótát szeretnél használni, itt megadhatod a saját Gemini API kulcsodat, amely kizárólag a böngésződben (<code className="font-mono text-[10px]">localStorage</code>) tárolódik.
                  </p>
                </div>
              </div>

              {/* API Key Input field */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Gemini API Kulcs (API Key)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons for API key validation */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestKey}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black cursor-pointer border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Kulcs Tesztelése / Kapcsolat Ellenőrzése
                </button>

                {isSaved && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3.5 py-2 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 rounded-xl text-[10px] font-black cursor-pointer text-rose-500 transition-all"
                  >
                    Kulcs Törlése
                  </button>
                )}
              </div>

              {/* Status Message area */}
              {testStatus !== 'idle' && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2.5 border ${
                  testStatus === 'testing' 
                    ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400' 
                    : testStatus === 'success'
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}>
                  {testStatus === 'testing' ? (
                    <div className="w-4 h-4 border-2 border-blue-500/25 border-t-blue-500 rounded-full animate-spin shrink-0 mt-0.5" />
                  ) : testStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}

              {/* EDUCATIONAL SECTION: VERCEL ENV VARS & SECURITY */}
              <div className="border-t border-slate-200 dark:border-slate-850 pt-5 space-y-4">
                <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Github className="w-4 h-4" />
                  Hogyan állítsd be biztonságosan a kulcsot Vercel-en?
                </h4>

                <div className="p-4 bg-slate-50 dark:bg-[#080b11] border border-slate-150 dark:border-slate-850 rounded-xl space-y-3.5">
                  <div className="flex gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-850 dark:text-slate-200">Soha ne írd be a kódfájlokba!</strong>
                      <p className="mt-0.5 font-medium leading-relaxed">
                        A kulcsokat soha ne hardkódold bele a feltöltött fájlokba vagy a GitHub repóba, mert a publikus kulcsokat azonnal letiltják a Google rendszerei.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-850 dark:text-slate-200">Vercel Environment Variables (Ajánlott):</strong>
                      <p className="mt-0.5 font-medium leading-relaxed">
                        A Vercel vezérlőpulton menj a <strong className="text-slate-800 dark:text-slate-300">Settings → Environment Variables</strong> menüpontra, vegyél fel egy <code className="font-mono bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">GEMINI_API_KEY</code> változót a kulcsoddal, majd indíts egy Redeploy-t. Így minden látogatónál biztonságosan, szerveroldalon fut az AI!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-slate-850 dark:text-slate-200">Egyéni böngészőbeli felülbírálás:</strong>
                      <p className="mt-0.5 font-medium leading-relaxed">
                        Ha nincs beállítva központi kulcs, ebben az ablakban bármikor megadhatod a sajátodat a böngésződ helyi tárolójában.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Helpful link to Google AI Studio */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <a 
                    href="https://aistudio.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                  >
                    <span>Ingyenes Gemini API Kulcs Szerzése</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1 text-emerald-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Helyi Tárolás Garantált</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-[#090b11] flex justify-end gap-3.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl text-xs font-black cursor-pointer text-slate-700 dark:text-slate-350 transition-colors"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-[0_0_12px_rgba(37,99,235,0.2)]"
              >
                Mentés és Bezárás
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
