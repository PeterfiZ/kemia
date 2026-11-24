import React, { useState } from 'react';
import { ElementData } from '../data/elements';
import { QuizQuestion, QuizSession, UserProfile } from '../types';
import { Award, CheckCircle2, XCircle, HelpCircle, ArrowRight, Play, RefreshCw, Trophy, BookOpen } from 'lucide-react';
import { CATEGORY_MAP } from './PeriodicTable';

interface QuizPanelProps {
  elements: ElementData[];
  currentProfile: UserProfile | null;
  onSaveSession: (session: QuizSession) => void;
}

export default function QuizPanel({ elements, currentProfile, onSaveSession }: QuizPanelProps) {
  const [quizState, setQuizState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [topic, setTopic] = useState<string>('minden');
  const [length, setLength] = useState<number>(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [historyAnswers, setHistoryAnswers] = useState<{ q: QuizQuestion; given: string; correct: boolean }[]>([]);

  // Generate customized questions on the fly
  const generateQuiz = () => {
    // Filter pools
    let pool = [...elements];
    let topicLabel = 'Minden elem';

    if (topic === 'nemesgazok') {
      pool = elements.filter(e => e.category === 'nemesgaz');
      topicLabel = 'Nemesgázok';
    } else if (topic === 'femek') {
      pool = elements.filter(e => ['alkalifem', 'alkalifoldfem', 'atmenetifem', 'posztatmenetifem'].includes(e.category));
      topicLabel = 'Fémek';
    } else if (topic === 'nemfemek') {
      pool = elements.filter(e => ['nemfem', 'halogen'].includes(e.category));
      topicLabel = 'Nemfémek';
    }

    if (pool.length < 4) {
      pool = [...elements]; // Fail safe fallback
      topicLabel = 'Minden elem';
    }

    const generated: QuizQuestion[] = [];
    const usedIndices = new Set<number>();

    // Generate balanced random questions
    const Q_TYPES = ['symbol', 'name', 'number', 'state', 'category'];

    for (let i = 0; i < length; i++) {
      let targetEl: ElementData;
      let attempts = 0;
      do {
        targetEl = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
      } while (usedIndices.has(targetEl.number) && attempts < 100);

      usedIndices.add(targetEl.number);

      const type = Q_TYPES[Math.floor(Math.random() * Q_TYPES.length)];
      let questionText = '';
      let correctAnswer = '';
      let options: string[] = [];
      let explanation = '';

      if (type === 'symbol') {
        questionText = `Mi a vegyjele a(z) ${targetEl.name} nevű elemnek?`;
        correctAnswer = targetEl.symbol;
        explanation = `A(z) ${targetEl.name} vegyjele ${targetEl.symbol} (${targetEl.number}. rendszámmal).`;

        // options pool
        const others = elements.filter(e => e.symbol !== correctAnswer);
        const wrongOpts = shuffle(others).slice(0, 3).map(e => e.symbol);
        options = shuffle([correctAnswer, ...wrongOpts]);

      } else if (type === 'name') {
        questionText = `Melyik kémiai elemet jelöli a(z) "${targetEl.symbol}" vegyjel?`;
        correctAnswer = targetEl.name;
        explanation = `A(z) "${targetEl.symbol}" vegyjel a(z) ${targetEl.name} elemet takarja.`;

        const others = elements.filter(e => e.name !== correctAnswer);
        const wrongOpts = shuffle(others).slice(0, 3).map(e => e.name);
        options = shuffle([correctAnswer, ...wrongOpts]);

      } else if (type === 'number') {
        questionText = `Mi a rendszáma a(z) ${targetEl.name} (${targetEl.symbol}) elemnek?`;
        correctAnswer = targetEl.number.toString();
        explanation = `A(z) ${targetEl.name} rendszáma ${targetEl.number}, ez jelzi a protonjainak számát.`;

        const wrongNums = new Set<string>();
        while (wrongNums.size < 3) {
          const randNum = (Math.max(1, Math.min(118, targetEl.number + Math.floor(Math.random() * 15) - 7))).toString();
          if (randNum !== correctAnswer) wrongNums.add(randNum);
        }
        options = shuffle([correctAnswer, ...Array.from(wrongNums)]);

      } else if (type === 'state') {
        questionText = `Milyen a halmazállapota a(z) ${targetEl.name} (${targetEl.symbol}) elemnek szobahőmérsékleten?`;
        correctAnswer = targetEl.state;
        explanation = `A(z) ${targetEl.name} szobahőmérsékleten és normál nyomáson ${targetEl.state} halmazállapotú.`;
        options = ['szilárd', 'folyékony', 'gáz', 'mesterséges'];

      } else {
        const hLabel = CATEGORY_MAP[targetEl.category]?.label || 'egyéb';
        questionText = `Melyik kémiai elemcsaládba / kategóriába sorolható a(z) ${targetEl.name} (${targetEl.symbol})?`;
        correctAnswer = hLabel;
        explanation = `A(z) ${targetEl.name} a(z) ${hLabel} család oszlopos tagja.`;

        const otherLabels = Object.values(CATEGORY_MAP).map(v => v.label).filter(l => l !== correctAnswer);
        const wrongOpts = shuffle(otherLabels).slice(0, 3);
        options = shuffle([correctAnswer, ...wrongOpts]);
      }

      generated.push({
        question: questionText,
        options,
        correctAnswer,
        explanation,
        elementNumber: targetEl.number
      });
    }

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setHistoryAnswers([]);
    setQuizState('playing');
  };

  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const handleSelectAnswer = (ans: string) => {
    if (isAnswered) return;
    setSelectedAnswer(ans);
  };

  const handleVerify = () => {
    if (!selectedAnswer || isAnswered) return;

    const currentQ = questions[currentIdx];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;

    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }

    setHistoryAnswers(prev => [...prev, {
      q: currentQ,
      given: selectedAnswer,
      correct: isCorrect
    }]);

    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Completed, save session to parent
      const accuracy = Math.round((correctAnswersCount / length) * 100);
      const session: QuizSession = {
        id: 'quiz-' + Date.now(),
        timestamp: Date.now(),
        score: correctAnswersCount,
        totalQuestions: length,
        accuracy,
        topic: topic === 'minden' ? 'Minden elem' : topic === 'nemesgazok' ? 'Nemesgázok' : topic === 'femek' ? 'Fémek' : 'Nemfémek'
      };
      
      onSaveSession(session);
      setQuizState('completed');
    }
  };

  return (
    <div className="bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-8 shadow-xl max-w-3xl mx-auto relative overflow-hidden transition-colors duration-300" id="kviz-ablak">
      {/* Background glow ambient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Quiz setup Mode */}
      {quizState === 'setup' && (
        <div className="text-center py-6 relative z-10">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-display">Interaktív Kémia Kvíz</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            Mérd fel a tudásod a periódusos rendszer elemeivel kapcsolatban szórakoztató, feleletválasztós kérdéssorunkkal!
          </p>

          <div className="bg-slate-50 dark:bg-[#070910]/75 p-6 rounded-2xl max-w-md mx-auto border border-slate-200 dark:border-slate-800/60 text-left mb-6 shadow-lg transition-colors duration-300">
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Témaválasztás</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setTopic('minden')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition ${
                    topic === 'minden' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-[#0c0f17]/40 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700'
                  }`}
                  id="kviz-topic-minden"
                >
                  🌐 Minden Elem (Köztük a Lanthanoidák is)
                </button>
                <button 
                  onClick={() => setTopic('femek')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition ${
                    topic === 'femek' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-[#0c0f17]/40 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  ⚡ Fémek (Alkálifémek, Átmeneti fémek)
                </button>
                <button 
                  onClick={() => setTopic('nemfemek')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition ${
                    topic === 'nemfemek' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-[#0c0f17]/40 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  🔥 Nemfémek & Halogének
                </button>
                <button 
                  onClick={() => setTopic('nemesgazok')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer transition ${
                    topic === 'nemesgazok' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-[#0c0f17]/40 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  🌬️ Nemesgázok (Inert elemek)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Kérdések száma</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(num => (
                  <button
                    key={num}
                    onClick={() => setLength(num)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition ${
                      length === num 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.25)]' 
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-[#0c0f17]/40 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    {num} kérdés
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateQuiz}
            className="bg-slate-100 dark:bg-[#101422] hover:bg-slate-200 dark:hover:bg-[#12182c] border border-slate-200 dark:border-blue-500/50 hover:border-slate-300 dark:hover:border-blue-400 text-blue-600 dark:text-blue-400 px-8 py-3.5 rounded-xl font-bold transition shadow-lg flex items-center gap-1.5 mx-auto text-sm cursor-pointer"
            id="indit-kviz-gomb"
          >
            <Play size={16} fill="none" className="text-blue-600 dark:text-blue-400" />
            Kvíz indítása
          </button>
        </div>
      )}

      {/* Quiz Playing Gameplay */}
      {quizState === 'playing' && questions.length > 0 && (
        <div className="relative z-10 animate-fade-in">
          {/* Top progress metadata */}
          <div className="flex justify-between items-center text-xs mb-2 font-bold text-slate-500 dark:text-slate-400">
            <span>Kategória: {topic === 'minden' ? 'Minden elem' : topic === 'nemesgazok' ? 'Nemesgázok' : topic === 'femek' ? 'Fémek' : 'Nemfémek'}</span>
            <span>{currentIdx + 1} / {length} Kérdés</span>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full mb-6 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              style={{ width: `${((currentIdx + 1) / length) * 100}%` }}
            />
          </div>

          {/* Current question panel */}
          <div className="mb-6">
            <div className="flex gap-2 text-blue-600 dark:text-blue-400 items-start mb-3">
              <HelpCircle className="shrink-0 mt-0.5" size={20} />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {questions[currentIdx].question}
              </h3>
            </div>
          </div>

          {/* Multiple choice options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {questions[currentIdx].options.map((opt, oIdx) => {
              const cleanOpt = opt.trim();
              const isSelected = selectedAnswer === cleanOpt;
              const isCorrectOpt = cleanOpt === questions[currentIdx].correctAnswer;

              let btnStyle = 'border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-[#070910]/60 hover:bg-slate-100 dark:hover:bg-[#0e1220]/60 hover:border-slate-350 dark:hover:border-slate-700';

              if (isAnswered) {
                if (isCorrectOpt) {
                  // highlight exact correct key
                  btnStyle = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]';
                } else if (isSelected) {
                  // incorrect user pick highlight
                  btnStyle = 'border-rose-550/80 bg-rose-500/10 text-rose-600 dark:text-rose-400';
                } else {
                  btnStyle = 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600 opacity-40';
                }
              } else if (isSelected) {
                // simple highlighted state
                btnStyle = 'border-blue-550/80 bg-blue-550/10 text-blue-650 dark:text-blue-400 font-extrabold ring-1 ring-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectAnswer(cleanOpt)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-bold transition flex justify-between items-center ${btnStyle} ${!isAnswered ? 'cursor-pointer animate-hover' : 'cursor-default'}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && (
                    <CheckCircle2 size={16} className="text-emerald-550 dark:text-emerald-500" />
                  )}
                  {isAnswered && isSelected && !isCorrectOpt && (
                    <XCircle size={16} className="text-rose-550 dark:text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom explanations and controls */}
          <div className="flex flex-col gap-4">
            {/* Show local didactics when answered */}
            {isAnswered && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-start gap-2.5">
                <BookOpen className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-bounce" size={18} />
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Didaktikai Segédlet:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    {questions[currentIdx].explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Verification buttons */}
            <div className="flex justify-end mt-2">
              {!isAnswered ? (
                <button
                  onClick={handleVerify}
                  disabled={!selectedAnswer}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition ${
                    selectedAnswer 
                      ? 'bg-slate-100 dark:bg-[#101422] hover:bg-slate-200 dark:hover:bg-[#12182c] border border-slate-250 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] cursor-pointer' 
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-650 opacity-40 cursor-not-allowed'
                  }`}
                  id="btn-verify-answer"
                >
                  Válasz ellenőrzése
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-slate-100 dark:bg-[#101422] hover:bg-slate-200 dark:hover:bg-[#12182c] border border-slate-250 dark:border-blue-550/50 hover:border-slate-300 dark:hover:border-blue-400 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  id="btn-next-question"
                >
                  <span>{currentIdx + 1 === length ? 'Eredmények megtekintése' : 'Következő kérdés'}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Completed report cards */}
      {quizState === 'completed' && (
        <div className="text-center py-6 relative z-10 animate-fade-in">
          <div className="w-18 h-18 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Trophy size={40} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-display">Gratulálok, Teljesítetted!</h2>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-1.5 mb-6">
            Kvízeredményeidet sikeresen naplóztuk a profilodon!
          </p>

          {/* Results Summary Box */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-slate-50 dark:bg-[#070910]/75 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg transition-colors duration-300">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Helyes válaszok</span>
              <strong className="text-xl font-extrabold text-slate-850 dark:text-slate-250 mt-1 block font-mono">
                {correctAnswersCount} / {length}
              </strong>
            </div>

            <div className="bg-slate-50 dark:bg-[#070910]/75 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg transition-colors duration-300">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pontosság</span>
              <strong className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
                {Math.round((correctAnswersCount / length) * 100)}%
              </strong>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setQuizState('setup')}
              className="bg-slate-100 dark:bg-[#101422] hover:bg-slate-200 dark:hover:bg-[#12182c] border border-slate-200 dark:border-blue-550/50 hover:border-slate-350 dark:hover:border-blue-400 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg cursor-pointer"
              id="uj-kviz-indit"
            >
              Új kvízkör indítása
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
