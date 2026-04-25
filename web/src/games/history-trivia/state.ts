import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type QuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface QuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Trojan War was fought between the Greeks and which city?", choices: ["Athens", "Carthage", "Troy", "Sparta"], correct: 2 },
  { question: "Who was the first Emperor of China?", choices: ["Wu Zetian", "Kublai Khan", "Sun Yat-sen", "Qin Shi Huang"], correct: 3 },
  { question: "The Black Death pandemic peaked in Europe during which century?", choices: ["12th", "13th", "14th", "15th"], correct: 2 },
  { question: "The Battle of Waterloo took place in which year?", choices: ["1812", "1814", "1815", "1820"], correct: 2 },
  { question: "Who was Cleopatra's Roman lover before Mark Antony?", choices: ["Augustus", "Julius Caesar", "Pompey", "Crassus"], correct: 1 },
  { question: "The ancient Library of Alexandria was located in?", choices: ["Greece", "Italy", "Egypt", "Libya"], correct: 2 },
  { question: "Which civilization built Machu Picchu?", choices: ["Aztec", "Maya", "Olmec", "Inca"], correct: 3 },
  { question: "The Hundred Years' War was fought between England and which country?", choices: ["Spain", "France", "Germany", "Italy"], correct: 1 },
  { question: "Who was the last Tsar of Russia?", choices: ["Alexander III", "Nicholas II", "Alexander II", "Paul I"], correct: 1 },
  { question: "The Ottoman Empire was centered in present-day?", choices: ["Iraq", "Iran", "Egypt", "Turkey"], correct: 3 },
  { question: "In which year did the United States declare independence?", choices: ["1774", "1775", "1776", "1783"], correct: 2 },
  { question: "The Code of Hammurabi was a legal code from which civilization?", choices: ["Egyptian", "Persian", "Babylonian", "Assyrian"], correct: 2 },
  { question: "Who built the first transcontinental railroad in the United States?", choices: ["Union Pacific and Central Pacific", "Southern Pacific and Northern Pacific", "Baltimore & Ohio", "Pennsylvania Railroad"], correct: 0 },
  { question: "The Meiji Restoration took place in which country?", choices: ["China", "Korea", "Japan", "Vietnam"], correct: 2 },
  { question: "Which ancient wonder of the world still stands today?", choices: ["Hanging Gardens of Babylon", "Colossus of Rhodes", "Great Pyramid of Giza", "Lighthouse of Alexandria"], correct: 2 },
  { question: "Martin Luther King Jr.'s 'I Have a Dream' speech was delivered in which year?", choices: ["1961", "1962", "1963", "1965"], correct: 2 },
  { question: "The Cold War was primarily between the USA and?", choices: ["China", "Cuba", "Soviet Union", "Germany"], correct: 2 },
  { question: "Which empire was known as the 'Empire on which the sun never sets'?", choices: ["French Empire", "Spanish Empire", "Portuguese Empire", "British Empire"], correct: 3 },
  { question: "The Silk Road connected which two major regions?", choices: ["Africa and Europe", "Europe and Asia", "Asia and Americas", "Africa and Asia"], correct: 1 },
  { question: "Julius Caesar was assassinated on which date?", choices: ["January 15", "March 15", "May 15", "July 15"], correct: 1 },
  { question: "The Rosetta Stone helped scholars decipher?", choices: ["Cuneiform", "Linear A", "Ancient Greek", "Egyptian hieroglyphics"], correct: 3 },
  { question: "The Warsaw Pact was a military alliance led by?", choices: ["United States", "China", "Soviet Union", "Germany"], correct: 2 },
  { question: "Who led the Long March in China?", choices: ["Sun Yat-sen", "Deng Xiaoping", "Mao Zedong", "Zhou Enlai"], correct: 2 },
  { question: "The Partition of India in 1947 created India and?", choices: ["Bangladesh", "Pakistan", "Sri Lanka", "Nepal"], correct: 1 },
  { question: "Which country was the first to give women the right to vote nationally?", choices: ["United States", "Finland", "New Zealand", "Australia"], correct: 2 },
  { question: "The Eiffel Tower was built for which world fair?", choices: ["1876 Philadelphia Exposition", "1889 Paris World Fair", "1893 Chicago World's Fair", "1900 Paris Exposition"], correct: 1 },
  { question: "The Cuban Missile Crisis occurred in?", choices: ["1960", "1961", "1962", "1963"], correct: 2 },
  { question: "Genghis Khan founded which empire?", choices: ["Mongol Empire", "Chinese Empire", "Ottoman Empire", "Timurid Empire"], correct: 0 },
  { question: "Which country was NOT part of the Allied Powers in World War II?", choices: ["France", "Soviet Union", "Italy", "United Kingdom"], correct: 2 },
  { question: "The Aztec Empire was conquered by?", choices: ["Francisco Pizarro", "Hernán Cortés", "Juan Ponce de León", "Vasco Núñez de Balboa"], correct: 1 },
  { question: "The Treaty of Versailles ended which war?", choices: ["Franco-Prussian War", "The Crimean War", "World War I", "World War II"], correct: 2 },
  { question: "The first moon landing was in which year?", choices: ["1967", "1968", "1969", "1971"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng);
  pool = pool.slice(0, Math.min(count, pool.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: QuizState, action: QuizAction): QuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": {
      if (state.submitted) return state;
      return { ...state, selected: action.choice };
    }
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const speedBonus = isCorrect ? Math.floor(state.timeLeft * 10) : 0;
      const points = isCorrect ? 100 + speedBonus : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      return { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
