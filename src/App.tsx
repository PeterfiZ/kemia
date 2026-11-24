import React, { useState, useEffect } from 'react';
import { ELEMENTS, ElementData } from './data/elements';
import { UserProfile, Badge, QuizSession, KNOWN_BADGES } from './types';
import PeriodicTable from './components/PeriodicTable';
import ElementDetails from './components/ElementDetails';
import ProfilePanel from './components/ProfilePanel';
import QuizPanel from './components/QuizPanel';
import ComparisonTool from './components/ComparisonTool';
import ReactionLab from './components/ReactionLab';
import ApiKeyModal from './components/ApiKeyModal';
import { Sparkles, BarChart3, Trophy, User, Sun, Moon, Atom, ChevronRight, Flame, Beaker, Key } from 'lucide-react';
import brandLogo from './assets/brand_logo.jpg';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(ELEMENTS[0]); // default H
  const [activeTab, setActiveTab] = useState<'table' | 'compare' | 'quiz' | 'profile' | 'reaction'>('table');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedCompareElements, setSelectedCompareElements] = useState<ElementData[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true); // default dark modern
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);

  // Load and apply theme and profile states
  useEffect(() => {
    // Sync dark class on body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle element selection/visiting
  const handleElementSelect = (element: ElementData) => {
    setSelectedElement(element);
    setActiveTab('table'); // ensure user views grid Details panel

    // Auto add to viewed list if profile is active
    if (currentProfile) {
      const alreadyViewed = currentProfile.viewedElements.includes(element.number);
      if (!alreadyViewed) {
        const updatedViewed = [...currentProfile.viewedElements, element.number];
        const updatedProf = {
          ...currentProfile,
          viewedElements: updatedViewed
        };
        checkAndTriggerBadges(updatedProf);
      }
    }
  };

  // Profile selection
  const handleSelectProfile = (profile: UserProfile) => {
    setCurrentProfile(profile);
    // Double check streaks on login
    const today = new Date().setHours(0,0,0,0);
    const lastActiveDay = new Date(profile.lastActive).setHours(0,0,0,0);
    
    let updatedProfile = { ...profile };

    if (today !== lastActiveDay) {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (today - lastActiveDay === oneDayInMs) {
        // consecutive day! Increase streak
        updatedProfile.streak = profile.streak + 1;
      } else if (today - lastActiveDay > oneDayInMs) {
        // broken streak, reset to 1
        updatedProfile.streak = 1;
      }
      updatedProfile.lastActive = Date.now();
      
      // Save
      saveSingleProfile(updatedProfile);
    }
  };

  // Update profile in localStorage list
  const saveSingleProfile = (updated: UserProfile) => {
    setCurrentProfile(updated);
    const saved = localStorage.getItem('periodic_profiles');
    if (saved) {
      try {
        const parsed: UserProfile[] = JSON.parse(saved);
        const filtered = parsed.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem('periodic_profiles', JSON.stringify(filtered));
      } catch (e) {
        console.error("Error saving single profile", e);
      }
    }
  };

  // Check achievements and award badges dynamically
  const checkAndTriggerBadges = (profile: UserProfile) => {
    const freshBadges: Badge[] = [...(profile.badges || [])];
    const unlockedIds = new Set(freshBadges.map(b => b.id));

    // Badge 1: first_element
    if (profile.viewedElements.length >= 1 && !unlockedIds.has('first_element')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'first_element')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 2: alkali_master [Li: 3, Na: 11, K: 19, Rb: 37, Cs: 55, Fr: 87]
    const alkaliNumbers = [3, 11, 19, 37, 55, 87];
    const viewedAllAlkali = alkaliNumbers.every(n => profile.viewedElements.includes(n));
    if (viewedAllAlkali && !unlockedIds.has('alkali_master')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'alkali_master')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 3: halogens_master [F: 9, Cl: 17, Br: 35, I: 53, At: 85, Ts: 117]
    const halogenNumbers = [9, 17, 35, 53, 85, 117];
    const viewedAllHalogen = halogenNumbers.every(n => profile.viewedElements.includes(n));
    if (viewedAllHalogen && !unlockedIds.has('halogens_master')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'halogens_master')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 4: noble_master [He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54, Rn: 86, Og: 118]
    const nobleNumbers = [2, 10, 18, 36, 54, 86, 118];
    const viewedAllNoble = nobleNumbers.every(n => profile.viewedElements.includes(n));
    if (viewedAllNoble && !unlockedIds.has('noble_master')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'noble_master')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 5: polymath
    if (profile.viewedElements.length >= 15 && !unlockedIds.has('polymath')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'polymath')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 6: quiz_beginner
    if (profile.quizSessions.length >= 1 && !unlockedIds.has('quiz_beginner')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'quiz_beginner')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 7: quiz_perfect (any quiz count with 100% and >= 5 questions)
    const hasPerfectQuiz = profile.quizSessions.some(qs => qs.accuracy === 100 && qs.totalQuestions >= 5);
    if (hasPerfectQuiz && !unlockedIds.has('quiz_perfect')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'quiz_perfect')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    // Badge 8: Streak 3
    if (profile.streak >= 3 && !unlockedIds.has('streak_3')) {
      const bInfo = KNOWN_BADGES.find(b => b.id === 'streak_3')!;
      freshBadges.push({ ...bInfo, unlockedAt: Date.now() });
    }

    const updatedProfile = {
      ...profile,
      badges: freshBadges
    };

    saveSingleProfile(updatedProfile);
  };

  // Log quiz score to active profile state
  const handleSaveQuizSession = (session: QuizSession) => {
    if (!currentProfile) return;

    const updatedSessions = [...(currentProfile.quizSessions || []), session];
    const updatedProf = {
      ...currentProfile,
      quizSessions: updatedSessions
    };

    checkAndTriggerBadges(updatedProf);
  };

  // Compare mode elements toggling
  const handleToggleCompare = (element: ElementData) => {
    const alreadySelected = selectedCompareElements.some(e => e.number === element.number);
    if (alreadySelected) {
      setSelectedCompareElements(prev => prev.filter(e => e.number !== element.number));
    } else {
      if (selectedCompareElements.length >= 4) {
        alert("Egyszerre legfeljebb 4 elemet tudsz grafikonon összehasonlítani!");
        return;
      }
      setSelectedCompareElements(prev => [...prev, element]);
      setActiveTab('compare'); // auto navigate to comparison charts
    }
  };  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] dark:bg-[#05070a] text-slate-700 dark:text-slate-300 font-sans overflow-x-hidden select-none transition-colors duration-300">
      
      {/* LEFT NAVIGATION SIDEBAR (Immersive UI Style) */}
      <aside className="w-full md:w-20 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 flex flex-row md:flex-col items-center justify-between py-4 md:py-8 px-6 md:px-0 gap-6 bg-white dark:bg-[#090b10] shrink-0 sticky top-0 z-50 transition-colors duration-300">
        {/* Brand Logo with Glow */}
        <div 
          onClick={() => setActiveTab('table')}
          className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer hover:scale-105 transition-all border border-amber-500/30 flex items-center justify-center bg-black"
          title="Péterfi ChemApp"
        >
          <img src={brandLogo} alt="Péterfi ChemApp Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex flex-row md:flex-col gap-2.5 md:gap-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border-slate-250 dark:border-slate-700/50 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            title="Periódusos Tábla rács"
          >
            <Atom size={20} />
          </button>

          <button
            onClick={() => {
              setActiveTab('compare');
              setCompareMode(true);
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              activeTab === 'compare'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border-slate-250 dark:border-slate-700/50 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            title="Összehasonlító Diagramm"
          >
            <BarChart3 size={20} />
          </button>

          <button
            onClick={() => setActiveTab('reaction')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              activeTab === 'reaction'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border-slate-250 dark:border-slate-700/50 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            title="Kémiai Kísérleti Labor"
          >
            <Beaker size={20} />
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              activeTab === 'quiz'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border-slate-250 dark:border-slate-700/50 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            title="Interaktív Kémia Kvíz"
          >
            <Trophy size={20} />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              activeTab === 'profile'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border-slate-250 dark:border-slate-700/50 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
            }`}
            title="Tanulói Profil"
          >
            <User size={20} />
          </button>
        </nav>

        {/* User profile / theme switches at bottom */}
        <div className="flex flex-row md:flex-col items-center gap-4">
          {/* Custom Gemini API Key Settings trigger */}
          <button
            onClick={() => setIsApiKeyOpen(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
            title="Saját Gemini API Kulcs Beállítása"
          >
            <Key size={20} />
          </button>

          {/* Dynamic Light/Dark switch button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
            title={darkMode ? "Világos mód bekapcsolása" : "Sötét mód bekapcsolása"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {currentProfile ? (
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-900 cursor-pointer overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 transition"
              title={`Bejelentkezve: ${currentProfile.name}`}
            >
              <span className="text-sm select-none">{currentProfile.avatar}</span>
            </div>
          ) : (
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-550 flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              <User size={16} />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 bg-space-gradient transition-colors duration-300">
        
        {/* UPPER MAIN HEADER */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between px-6 md:px-8 py-3 bg-white/45 dark:bg-[#090b10]/40 backdrop-blur-md gap-3 shrink-0 transition-colors duration-300">
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-slate-800 dark:text-slate-200 uppercase font-display flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Péterfi ChemApp — {activeTab === 'table' && 'Interaktív Periódusos Rendszer'}
              {activeTab === 'compare' && 'Összehasonlító Stúdió'}
              {activeTab === 'reaction' && 'Kísérleti Reakció Labor'}
              {activeTab === 'quiz' && 'Kémia Tesztözön Kvíz'}
              {activeTab === 'profile' && 'Saját Tanulói Labor'}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold tracking-tight mt-0.5">
              {activeTab === 'table' && 'Kattints az elemekre a Bohr-atommodell és az AI Mentor indításához!'}
              {activeTab === 'compare' && 'Hasonlítsd össze az elektronegativitást, sűrűséget és atomsugarakat.'}
              {activeTab === 'reaction' && 'Szimulálj kémiai reakciókat tetszőleges elemek között AI-alapú előrejelzéssel!'}
              {activeTab === 'quiz' && 'Tedd próbára a tudásod, gyűjts pontokat és szerezz jelvényeket!'}
              {activeTab === 'profile' && 'Kezeld proﬁljaidat és kövesd nyomon a tanulási statisztikáidat.'}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Real Offline Badge status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Offline elérhető
            </div>

            {/* Quick action button based on context */}
            {activeTab !== 'quiz' ? (
              <button 
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.25)] flex items-center gap-1 cursor-pointer border-0"
              >
                <Trophy size={13} fill="white" />
                <span>Kvíz Indítása</span>
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('table')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-0"
              >
                <Atom size={13} />
                <span>Vissza a Rácshoz</span>
              </button>
            )}
          </div>
        </header>

        {/* WORKSPACE CENTRAL SECTION */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto">
          
          <div className="max-w-[1500px] mx-auto">
            {/* User Profile tab panel component */}
            {activeTab === 'profile' && (
              <ProfilePanel 
                currentProfile={currentProfile}
                onSelectProfile={handleSelectProfile}
                onProfileUpdate={saveSingleProfile}
              />
            )}

            {/* Main Interactive Grid & Sidebar details tab panel */}
            {activeTab === 'table' && (
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Left block Periodic grid */}
                <div className="flex-1 min-w-0 w-full">
                  <PeriodicTable 
                    elements={ELEMENTS}
                    onElementClick={handleElementSelect}
                    selectedElement={selectedElement}
                    viewedList={currentProfile?.viewedElements || []}
                    selectedCompareElements={selectedCompareElements}
                    onToggleCompare={handleToggleCompare}
                    compareMode={compareMode}
                    setCompareMode={setCompareMode}
                    onClearCompare={() => setSelectedCompareElements([])}
                  />
                </div>

                {/* Right side element drawer (Immersive UI Side-panel style matching) */}
                {selectedElement && (
                  <div className="w-full xl:w-[480px] shrink-0 top-6 sticky">
                    <ElementDetails 
                      element={selectedElement}
                      onExplore={(num) => {
                        if (currentProfile) {
                          const alreadyViewed = currentProfile.viewedElements.includes(num);
                          if (!alreadyViewed) {
                            const updated = {
                              ...currentProfile,
                              viewedElements: [...currentProfile.viewedElements, num]
                            };
                            checkAndTriggerBadges(updated);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Advanced Comparison panel */}
            {activeTab === 'compare' && (
              <ComparisonTool 
                selectedElements={selectedCompareElements}
                onRemoveElement={(el) => setSelectedCompareElements(prev => prev.filter(e => e.number !== el.number))}
                onClear={() => setSelectedCompareElements([])}
              />
            )}

            {/* Educational quiz panel */}
            {activeTab === 'quiz' && (
              <QuizPanel 
                elements={ELEMENTS}
                currentProfile={currentProfile}
                onSaveSession={handleSaveQuizSession}
              />
            )}

            {/* Experimental Chemical Reaction Lab panel */}
            {activeTab === 'reaction' && (
              <ReactionLab 
                elements={ELEMENTS}
                onExploreElement={handleElementSelect}
              />
            )}
          </div>

        </section>

        {/* COMPACT IMMERSIVE STATUS FOOTER */}
        <footer className="h-12 bg-[#090b10] border-t border-slate-900 flex items-center justify-between px-6 md:px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
          <div className="flex gap-6">
            <span>Tanulási haladás: <strong className="text-blue-400 font-bold">{currentProfile ? Math.round((currentProfile.viewedElements.length / 118) * 100) : 0}%</strong></span>
            <span>Mérföldkövek: <strong className="text-orange-400 font-bold">{currentProfile?.badges?.length || 0} db</strong></span>
            {currentProfile && currentProfile.streak > 1 && (
              <span className="flex items-center gap-1 text-amber-500">
                <Flame size={10} className="fill-current" />
                Streak: {currentProfile.streak} Nap
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Rendszer állapota: <strong className="text-emerald-400">Optimális</strong></span>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${currentProfile ? (currentProfile.viewedElements.length / 118) * 100 : 12}%` }}
              ></div>
            </div>
          </div>
        </footer>

        {/* Global Key Settings modal */}
        <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />

      </main>

    </div>
  );
}

