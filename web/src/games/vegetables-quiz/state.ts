import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VegetablesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VegetablesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface VegetablesQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which vegetable is the most widely grown in the world?", choices: ["Potato", "Tomato", "Onion", "Wheat"], correct: 0 },
  { question: "Broccoli is which part of the plant?", choices: ["Root", "Leaf", "Flower head", "Stem"], correct: 2 },
  { question: "Which vegetable can be white, yellow, or purple?", choices: ["Carrot", "Eggplant", "Cauliflower", "Beet"], correct: 2 },
  { question: "What vegetable was so valuable it was used as currency in medieval Europe?", choices: ["Onion", "Garlic", "Pepper", "Saffron"], correct: 0 },
  { question: "Which vegetable has the most protein per 100g (among common ones)?", choices: ["Spinach", "Edamame", "Peas", "Lentil sprouts"], correct: 1 },
  { question: "Asparagus belongs to which plant family?", choices: ["Lily family", "Mustard family", "Nightshade family", "Carrot family"], correct: 0 },
  { question: "Which vegetable is 95% water?", choices: ["Celery", "Lettuce", "Cucumber", "Zucchini"], correct: 2 },
  { question: "The artichoke is which part of the plant?", choices: ["A root", "An immature flower bud", "A leaf cluster", "A seed pod"], correct: 1 },
  { question: "Okra pods are used for their?", choices: ["Sweet flavor", "Thickening mucilage", "Bitter taste", "Crunchy texture only"], correct: 1 },
  { question: "Which vegetable gives urine a distinctive smell in some people?", choices: ["Beets", "Asparagus", "Cabbage", "Broccoli"], correct: 1 },
  { question: "Sweet potatoes are more closely related to?", choices: ["Potatoes", "Yams", "Morning glory", "Cassava"], correct: 2 },
  { question: "Which vegetable is sometimes called 'Chinese parsley'?", choices: ["Bok choy", "Cilantro", "Water spinach", "Chives"], correct: 1 },
  { question: "Kohlrabi is a swollen version of which part?", choices: ["Root", "Leaf base", "Stem", "Bulb"], correct: 2 },
  { question: "Which vegetable contains the most iron per serving?", choices: ["Kale", "Spinach", "Swiss chard", "Beet greens"], correct: 1 },
  { question: "Chili peppers are native to which continent?", choices: ["Asia", "Africa", "The Americas", "Australia"], correct: 2 },
  { question: "Leek, onion, and garlic belong to which genus?", choices: ["Brassica", "Allium", "Capsicum", "Solanum"], correct: 1 },
  { question: "Which vegetable is used to make the Israeli dish shakshuka?", choices: ["Eggplant", "Tomatoes and peppers", "Zucchini", "Cauliflower"], correct: 1 },
  { question: "Celery was originally used by ancient Greeks as?", choices: ["A food crop", "A funeral herb", "A medicine", "An aphrodisiac"], correct: 1 },
  { question: "Which vegetable can regenerate if you put its base in water?", choices: ["Carrot", "Green onion", "Radish", "Turnip"], correct: 1 },
  { question: "The ghost pepper (bhut jolokia) is known as one of the world's hottest. It's native to?", choices: ["Mexico", "India", "Thailand", "Ethiopia"], correct: 1 },
  { question: "Which root vegetable is highest in natural sugar?", choices: ["Carrot", "Beet", "Parsnip", "Turnip"], correct: 1 },
  { question: "Edamame is young what?", choices: ["Peas", "Fava beans", "Soybeans", "Lima beans"], correct: 2 },
  { question: "Which vegetable is used to make the French dish ratatouille?", choices: ["Artichoke", "Zucchini and eggplant", "Leeks", "Fennel"], correct: 1 },
  { question: "What compound makes onions cause tears?", choices: ["Allicin", "Syn-propanethial-S-oxide", "Quercetin", "Linalool"], correct: 1 },
  { question: "Which vegetable has been grown in space on the ISS?", choices: ["Tomato", "Lettuce", "Broccoli", "Cabbage"], correct: 1 },
  { question: "Cassava root must be properly prepared to remove?", choices: ["Oxalic acid", "Cyanogenic compounds", "Solanine", "Tannins"], correct: 1 },
  { question: "Romanesco broccoli displays which mathematical pattern?", choices: ["Fibonacci spiral", "Golden ratio", "Fractal pattern", "Both A and C"], correct: 3 },
  { question: "Which vegetable is also known as 'courgette' in British English?", choices: ["Eggplant", "Zucchini", "Squash", "Cucumber"], correct: 1 },
  { question: "Potatoes were introduced to Europe from which region?", choices: ["Central America", "The Andes of South America", "North America", "Caribbean"], correct: 1 },
  { question: "Which vegetable is the primary ingredient in kimchi?", choices: ["Daikon radish", "Napa cabbage", "Korean spinach", "Green onion"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: VegetablesQuizSettings): VegetablesQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: VegetablesQuizState, action: VegetablesQuizAction): VegetablesQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
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
      return newTime <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      return nextIndex >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: VegetablesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
