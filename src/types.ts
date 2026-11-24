import { ElementData } from './data/elements';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // Emoji or colour
  createdAt: number;
  viewedElements: number[]; // Atomic numbers of viewed elements
  quizSessions: QuizSession[];
  badges: Badge[];
  streak: number;
  lastActive: number; // For tracking daily streak
}

export interface QuizSession {
  id: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  accuracy: number; // Percentage
  topic: string; // e.g., 'Minden elem', 'Nemesgázok', 'Fémek'
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  unlockedAt: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  elementNumber?: number; // Related element
}

export const KNOWN_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_element', title: 'Első Lépések', description: 'Fedezd fel egy kémiai elem részletes adatait.', icon: 'Eye' },
  { id: 'alkali_master', title: 'Alkálifém Szakértő', description: 'Tekintsd meg az összes alkálifémet.', icon: 'Zap' },
  { id: 'halogens_master', title: 'Halogén Vadász', description: 'Ismerd meg az összes halogént.', icon: 'Flame' },
  { id: 'noble_master', title: 'Főnemes', description: 'Ismerd meg az összes inert nemesgázt.', icon: 'Crown' },
  { id: 'quiz_beginner', title: 'Kémia Újonc', description: 'Teljesíts sikeresen egy kvízt.', icon: 'CheckCircle' },
  { id: 'quiz_perfect', title: 'Zseniális Alkimista', description: 'Érj el 100%-os eredményt egy legalább 5 kérdéses kvízben.', icon: 'Sparkles' },
  { id: 'polymath', title: 'Mindentudó', description: 'Tekints meg legalább 15 különböző elemet.', icon: 'BookOpen' },
  { id: 'streak_3', title: 'Kitartó Kutató', description: 'Érj el 3 napos tanulási sorozatot (streak).', icon: 'Flame' }
];
