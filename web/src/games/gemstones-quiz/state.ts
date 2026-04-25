import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface GemstonesQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type GemstonesQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface GemstonesQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which gemstone is the hardest natural substance?", choices: ["Ruby", "Sapphire", "Diamond", "Topaz"], correct: 2 },
  { question: "Emeralds are a variety of which mineral?", choices: ["Corundum", "Beryl", "Quartz", "Feldspar"], correct: 1 },
  { question: "Rubies and sapphires are both varieties of which mineral?", choices: ["Beryl", "Spinel", "Corundum", "Chrysoberyl"], correct: 2 },
  { question: "Which gemstone is associated with the month of July?", choices: ["Emerald", "Sapphire", "Amethyst", "Ruby"], correct: 3 },
  { question: "The Hope Diamond is what color?", choices: ["Red", "Blue", "Green", "Yellow"], correct: 1 },
  { question: "Which gemstone is actually fossilized tree resin?", choices: ["Pearl", "Coral", "Amber", "Jet"], correct: 2 },
  { question: "What gives emeralds their green color?", choices: ["Iron", "Titanium", "Chromium and vanadium", "Manganese"], correct: 2 },
  { question: "Which country is the world's largest producer of diamonds by value?", choices: ["South Africa", "Russia", "Botswana", "Australia"], correct: 2 },
  { question: "Pearls are produced by?", choices: ["Oysters and mussels", "Sea urchins", "Coral polyps", "Clams only"], correct: 0 },
  { question: "On Mohs scale, diamond scores?", choices: ["8", "9", "9.5", "10"], correct: 3 },
  { question: "Which gemstone is the birthstone for September?", choices: ["Sapphire", "Opal", "Tourmaline", "Peridot"], correct: 0 },
  { question: "Amethyst is a variety of?", choices: ["Topaz", "Quartz", "Feldspar", "Beryl"], correct: 1 },
  { question: "Which gemstone has the play of color known as 'opalescence'?", choices: ["Moonstone", "Labradorite", "Opal", "Pearl"], correct: 2 },
  { question: "The Cullinan diamond was found in which country?", choices: ["India", "Brazil", "South Africa", "Botswana"], correct: 2 },
  { question: "What causes the star effect in star sapphires?", choices: ["Internal fractures", "Titanium inclusions", "Rutile needle inclusions", "Hollow canals"], correct: 2 },
  { question: "Which gemstone is blue-green and named after the sea?", choices: ["Aquamarine", "Blue topaz", "Turquoise", "Larimar"], correct: 0 },
  { question: "Tanzanite is found almost exclusively in which country?", choices: ["Tanzania", "Kenya", "Ethiopia", "Madagascar"], correct: 0 },
  { question: "Which of these is an organic gemstone (not a mineral)?", choices: ["Garnet", "Citrine", "Coral", "Tourmaline"], correct: 2 },
  { question: "What property describes how a gem interacts with light (sparkle)?", choices: ["Luster", "Fire (dispersion)", "Brilliance", "Scintillation"], correct: 1 },
  { question: "The term 'carat' when used for gemstones refers to?", choices: ["Purity", "Color grade", "Weight", "Clarity"], correct: 2 },
  { question: "Which gemstone is the hardest after diamond?", choices: ["Ruby", "Moissanite", "Sapphire", "Spinel"], correct: 1 },
  { question: "Alexandrite is known for?", choices: ["Its extremely high hardness", "Changing color in different light", "Being the rarest gemstone", "Perfect cleavage"], correct: 1 },
  { question: "Which gemstone is associated with love and is the most popular for engagement rings?", choices: ["Ruby", "Diamond", "Sapphire", "Emerald"], correct: 1 },
  { question: "Lapis lazuli is prized for its?", choices: ["Fire and brilliance", "Deep blue color with gold flecks", "Transparency", "Color-change effect"], correct: 1 },
  { question: "The 'four Cs' of diamond grading are cut, color, clarity, and?", choices: ["Carat weight", "Clarity", "Complexity", "Craft"], correct: 0 },
  { question: "Which gemstone is the birthstone for May?", choices: ["Diamond", "Emerald", "Pearl", "Alexandrite"], correct: 1 },
  { question: "Turquoise gets its color primarily from?", choices: ["Iron", "Copper", "Chromium", "Manganese"], correct: 1 },
  { question: "Which gemstone is known as the 'King of Gems' in some cultures?", choices: ["Diamond", "Ruby", "Sapphire", "Emerald"], correct: 1 },
  { question: "What is the name of the famous star ruby held in the American Museum of Natural History?", choices: ["Rosser Reeves", "De Long Star Ruby", "Edwardes Ruby", "Burmese Ruby"], correct: 1 },
  { question: "Which gemstone is formed only under extreme pressure deep in Earth's mantle?", choices: ["Amethyst", "Topaz", "Diamond", "Garnet"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: GemstonesQuizSettings): GemstonesQuizState {
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

export function reducer(state: GemstonesQuizState, action: GemstonesQuizAction): GemstonesQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": { if (state.submitted) return state; return { ...state, selected: action.choice }; }
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const points = isCorrect ? 100 + Math.floor(state.timeLeft * 10) : 0;
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

export function isTerminal(state: GemstonesQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
