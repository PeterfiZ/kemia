import React, { useState, useEffect } from 'react';
import { UserProfile, Badge, KNOWN_BADGES } from '../types';
import { Award, Flame, User, UserPlus, Trash2, Calendar, Check, GraduationCap, BarChart } from 'lucide-react';

interface ProfilePanelProps {
  currentProfile: UserProfile | null;
  onSelectProfile: (profile: UserProfile) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

export default function ProfilePanel({ currentProfile, onSelectProfile, onProfileUpdate }: ProfilePanelProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Load profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('periodic_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfiles(parsed);
        // If no profile is active, select the first one
        if (parsed.length > 0 && !currentProfile) {
          onSelectProfile(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to parse saved profiles", e);
      }
    } else {
      // Create a default profile
      const defaultProf: UserProfile = {
        id: 'default-student',
        name: 'Kezdő Vegyész',
        avatar: '🧪',
        createdAt: Date.now(),
        viewedElements: [],
        quizSessions: [],
        badges: [],
        streak: 1,
        lastActive: Date.now()
      };
      setProfiles([defaultProf]);
      localStorage.setItem('periodic_profiles', JSON.stringify([defaultProf]));
      onSelectProfile(defaultProf);
    }
  }, []);

  // Sync to local storage on any profile updates
  const saveAllProfiles = (updatedList: UserProfile[]) => {
    setProfiles(updatedList);
    localStorage.setItem('periodic_profiles', JSON.stringify(updatedList));
  };

  const createProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const avatars = ['🧪', '🔬', '🧠', '⚡', '🏆', '🛸'];
    const newProf: UserProfile = {
      id: 'profile-' + Date.now(),
      name: newProfileName.trim(),
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      createdAt: Date.now(),
      viewedElements: [],
      quizSessions: [],
      badges: [],
      streak: 1,
      lastActive: Date.now()
    };

    const updated = [...profiles, newProf];
    saveAllProfiles(updated);
    onSelectProfile(newProf);
    setNewProfileName('');
    setShowCreate(false);
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert("Legalább egy profilnak léteznie kell!");
      return;
    }
    const filtered = profiles.filter(p => p.id !== id);
    saveAllProfiles(filtered);
    if (currentProfile?.id === id) {
      onSelectProfile(filtered[0]);
    }
  };

  if (!currentProfile) return null;

  // Compute stats
  const totalExplored = currentProfile.viewedElements.length;
  const percentExplored = Math.round((totalExplored / 118) * 100);
  const quizCount = currentProfile.quizSessions.length;
  const avgAccuracy = quizCount > 0 
    ? Math.round(currentProfile.quizSessions.reduce((acc, q) => acc + q.accuracy, 0) / quizCount) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1 relative z-10" id="profil-panel">
      {/* Profiles management Left Card */}
      <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
        {/* Background glow ambient */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 font-display">
              <User className="text-blue-500" />
              Tanulói Profilok
            </h3>
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-[#101422] hover:bg-slate-100 dark:hover:bg-[#12182c] border border-blue-200 dark:border-blue-500/50 hover:border-blue-450 dark:hover:border-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              id="btn-new-profile"
            >
              <UserPlus size={15} />
              Új profil
            </button>
          </div>

          {showCreate && (
            <form onSubmit={createProfile} className="mb-4 bg-slate-50 dark:bg-[#070910]/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800/85">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Létrehozandó név</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Pl. Kovács Péter"
                  className="flex-1 bg-white dark:bg-[#090b10] text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  maxLength={15}
                  required
                />
                <button 
                  type="submit" 
                  className="bg-slate-100 dark:bg-[#101524] border border-slate-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 hover:border-blue-400 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center cursor-pointer"
                >
                  OK
                </button>
              </div>
            </form>
          )}

          {/* Profiles select list */}
          <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
            {profiles.map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectProfile(p)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  currentProfile.id === p.id 
                    ? 'bg-blue-50/50 dark:bg-[#101422] border-blue-500/50 shadow-md shadow-blue-500/5' 
                    : 'bg-slate-50/65 dark:bg-[#070910]/70 border-slate-200 dark:border-slate-900 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg shadow-sm">
                    {p.avatar}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-750 dark:text-slate-200 text-sm leading-tight">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Felfedezve: {p.viewedElements.length} elem
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentProfile.id === p.id && (
                    <span className="bg-blue-500 text-white p-0.5 rounded-full">
                      <Check size={11} />
                    </span>
                  )}
                  {profiles.length > 1 && (
                    <button 
                      onClick={(e) => deleteProfile(p.id, e)}
                      className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-500 p-1.5 rounded-lg transition"
                      title="Profil törlése"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action guidelines */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
          <Calendar size={14} className="text-blue-500" />
          <span>Létrehozva: {new Date(currentProfile.createdAt).toLocaleDateString('hu-HU')}</span>
        </div>
      </div>

      {/* Progress & Stats Middle Card */}
      <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
        {/* Background glow ambient */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-6 flex items-center gap-2 font-display">
            <GraduationCap className="text-cyan-500" />
            Tanulási Haladás
          </h3>

          {/* Explored meter */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Folyó haladás (felfedezett elemek)</span>
              <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 font-mono">{totalExplored} / 118 elem ({percentExplored}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                style={{ width: `${percentExplored}%` }}
              ></div>
            </div>
          </div>

          {/* Quick stats list */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-500/5 p-3 rounded-xl border border-orange-500/10 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Kitartás (Streak)</span>
              <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 font-extrabold text-xl">
                <Flame className="fill-current animate-pulse text-orange-500" size={20} />
                {currentProfile.streak} nap
              </div>
            </div>
            <div className="bg-fuchsia-500/5 p-3 rounded-xl border border-fuchsia-500/10 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Kvízek száma</span>
              <div className="text-fuchsia-600 dark:text-fuchsia-400 font-black text-xl font-mono">
                {quizCount} db
              </div>
            </div>
            <div className="col-span-2 bg-slate-50 dark:bg-[#0c0f17]/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-6 transition-colors duration-300">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kvízpontosság</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-350">Átlagos eredmény</span>
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-black text-xl font-mono">
                {avgAccuracy}%
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-500 mt-6 bg-slate-50 dark:bg-[#070910]/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 flex items-center gap-1.5 relative z-10 w-full transition-colors duration-300">
          <BarChart size={13} className="text-cyan-500 shrink-0" />
          <span>Kattints az elemekre a periódusos rendszerben a haladásod növeléséhez!</span>
        </p>
      </div>

      {/* Badges Right Card */}
      <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-6 shadow-xl flex flex-col justify-between lg:col-span-1 relative overflow-hidden transition-colors duration-300">
        {/* Background glow ambient */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2 font-display">
            <Award className="text-orange-500" />
            Elért Jelvények ({currentProfile.badges?.length || 0} db)
          </h3>

          <div className="grid grid-cols-4 gap-2.5 mt-4 overflow-y-auto max-h-[290px] pr-1">
            {KNOWN_BADGES.map(badge => {
              const unlocked = (currentProfile.badges || []).some(b => b.id === badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`group relative flex flex-col items-center p-2 rounded-xl transition cursor-default ${
                    unlocked 
                      ? 'bg-amber-500/5 dark:bg-[#070910]/80 border border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.08)]' 
                      : 'bg-slate-100 dark:bg-[#0c0f17]/30 opacity-40 border border-slate-200 dark:border-slate-900/50'
                  }`}
                >
                  <div className={`p-2.5 rounded-full shadow-sm transition-all duration-300 ${
                    unlocked 
                      ? 'bg-gradient-to-br from-amber-450 to-orange-550 text-white shadow-[0_0_10px_rgba(245,158,11,0.25)] scale-102' 
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-900 dark:text-slate-650'
                  }`}>
                    <Award size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 text-center line-clamp-1 w-full scale-95">
                    {badge.title}
                  </span>

                  {/* Built-in Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 backdrop-blur-md text-white text-xs rounded-lg p-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition z-50 shadow-2xl text-center border border-slate-800">
                    <p className="font-bold text-amber-400 mb-0.5">{badge.title}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{badge.description}</p>
                    {unlocked ? (
                      <p className="text-[9px] text-emerald-400 font-bold mt-1 shadow-sm">Megszerezve!</p>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-bold mt-1">Még zárolt</p>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-885/85 relative z-10 text-center">
          <p className="text-center text-[10px] text-orange-600 dark:text-orange-450 font-black uppercase tracking-widest">
            Legyél Te is a Kémia Mestere!
          </p>
        </div>
      </div>
    </div>
  );
}
