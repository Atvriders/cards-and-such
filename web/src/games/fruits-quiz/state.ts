import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface FruitsQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type FruitsQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface FruitsQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which fruit is known as the 'king of fruits'?", choices: ["Mango", "Durian", "Jackfruit", "Papaya"], correct: 1 },
  { question: "A tomato is botanically classified as?", choices: ["A vegetable", "A berry", "A drupe", "A legume"], correct: 1 },
  { question: "Which country is the world's largest producer of bananas?", choices: ["Ecuador", "India", "Philippines", "Brazil"], correct: 1 },
  { question: "What makes a strawberry technically not a berry?", choices: ["It grows on a vine", "It is an aggregate fruit", "It has no seeds inside", "It is a root fruit"], correct: 1 },
  { question: "Which fruit contains the enzyme bromelain used as a meat tenderizer?", choices: ["Papaya", "Pineapple", "Kiwi", "Mango"], correct: 1 },
  { question: "Avocado is classified botanically as?", choices: ["A nut", "A berry", "A drupe", "A pome"], correct: 2 },
  { question: "Which fruit has the most vitamin C per 100g?", choices: ["Orange", "Kiwi", "Acerola cherry", "Strawberry"], correct: 2 },
  { question: "What is a pomelo?", choices: ["A small lemon variety", "The largest citrus fruit", "A type of mandarin", "A hybrid of lime and orange"], correct: 1 },
  { question: "Figs are technically which type of fruit?", choices: ["Berry", "Drupe", "Inverted flower cluster", "Pome"], correct: 2 },
  { question: "Which fruit was the first to be grown in space?", choices: ["Apple", "Orange", "Tomato", "Cucumber"], correct: 2 },
  { question: "Grapes that are dried become?", choices: ["Prunes", "Raisins", "Currants", "Figs"], correct: 1 },
  { question: "Which fruit is sometimes called 'alligator pear'?", choices: ["Cherimoya", "Avocado", "Soursop", "Guanabana"], correct: 1 },
  { question: "The durian fruit is banned in public places in many Southeast Asian countries because of?", choices: ["Its spiky shell", "Its powerful smell", "Its toxicity when unripe", "Its large size"], correct: 1 },
  { question: "Which fruit is actually the world's largest?", choices: ["Pumpkin", "Watermelon", "Jackfruit", "Breadfruit"], correct: 2 },
  { question: "Lychee is native to which country?", choices: ["India", "Thailand", "China", "Vietnam"], correct: 2 },
  { question: "Persimmon is richest in which nutrient?", choices: ["Vitamin C", "Iron", "Beta-carotene", "Calcium"], correct: 2 },
  { question: "Which fruit contains natural melatonin?", choices: ["Apple", "Cherry", "Banana", "Grape"], correct: 1 },
  { question: "The quince is closely related to which fruit?", choices: ["Plum", "Pear", "Peach", "Fig"], correct: 1 },
  { question: "Olives are technically which type of fruit?", choices: ["Berry", "Drupe", "Pome", "Aggregate"], correct: 1 },
  { question: "Which country consumes the most fruit per person?", choices: ["USA", "Brazil", "China", "Rwanda"], correct: 3 },
  { question: "The blood orange gets its red color from?", choices: ["Iron pigments", "Anthocyanins", "Beta-carotene", "Lycopene"], correct: 1 },
  { question: "Which fruit is used to make grenadine syrup?", choices: ["Cherry", "Raspberry", "Pomegranate", "Cranberry"], correct: 2 },
  { question: "Kumquat differs from other citrus fruits because you eat?", choices: ["Only the juice", "The rind and all", "Only the segments", "Only the seeds"], correct: 1 },
  { question: "Which berry contains the most antioxidants?", choices: ["Blueberry", "Acai berry", "Goji berry", "Bilberry"], correct: 1 },
  { question: "Plums that are dried are called?", choices: ["Raisins", "Dates", "Prunes", "Figs"], correct: 2 },
  { question: "The passionfruit is native to which continent?", choices: ["Africa", "Asia", "South America", "Australia"], correct: 2 },
  { question: "What is the yellow part of a citrus peel called?", choices: ["Albedo", "Flavedo", "Zest", "Pulp"], correct: 1 },
  { question: "Dragon fruit is the fruit of which plant?", choices: ["A tropical shrub", "A cactus", "A vine", "A tree"], correct: 1 },
  { question: "Which fruit is associated with Newton's discovery of gravity?", choices: ["Pear", "Plum", "Apple", "Quince"], correct: 2 },
  { question: "Cranberries float in water during harvesting because?", choices: ["They are hollow inside", "They have air pockets", "They are very light", "They repel water"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: FruitsQuizSettings): FruitsQuizState {
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

export function reducer(state: FruitsQuizState, action: FruitsQuizAction): FruitsQuizState {
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

export function isTerminal(state: FruitsQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
