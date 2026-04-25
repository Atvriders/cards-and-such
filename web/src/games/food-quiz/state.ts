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
  { question: "Sushi originated in which country?", choices: ["China", "Korea", "Japan", "Vietnam"], correct: 2 },
  { question: "Which cheese has a blue-green mold running through it?", choices: ["Brie", "Camembert", "Gorgonzola", "Gruyere"], correct: 2 },
  { question: "Croissants originated in which country?", choices: ["France", "Austria", "Germany", "Switzerland"], correct: 1 },
  { question: "What is the main ingredient in guacamole?", choices: ["Tomato", "Onion", "Lime", "Avocado"], correct: 3 },
  { question: "Which spice comes from the stigma of a flower?", choices: ["Turmeric", "Paprika", "Saffron", "Cumin"], correct: 2 },
  { question: "Pizza Margherita was named after which Italian queen?", choices: ["Queen Elena", "Queen Maria", "Queen Margherita", "Queen Sofia"], correct: 2 },
  { question: "Borscht is a soup originating from?", choices: ["Poland", "Hungary", "Ukraine / Eastern Europe", "Romania"], correct: 2 },
  { question: "Which fruit is technically a berry in botanical terms?", choices: ["Strawberry", "Raspberry", "Blackberry", "Banana"], correct: 3 },
  { question: "What is the primary grain used to make sake?", choices: ["Wheat", "Barley", "Corn", "Rice"], correct: 3 },
  { question: "Kimchi is a traditional dish from which country?", choices: ["Japan", "China", "Korea", "Vietnam"], correct: 2 },
  { question: "Which vitamin is abundant in citrus fruits?", choices: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correct: 2 },
  { question: "The Maillard reaction occurs when food?", choices: ["Is boiled", "Is frozen", "Is browned by heat", "Is marinated"], correct: 2 },
  { question: "Pad Thai is a dish from which country?", choices: ["Vietnam", "Cambodia", "Indonesia", "Thailand"], correct: 3 },
  { question: "Which country produces the most coffee in the world?", choices: ["Colombia", "Vietnam", "Brazil", "Ethiopia"], correct: 2 },
  { question: "A 'roux' in cooking is a mixture of?", choices: ["Oil and egg", "Butter and flour", "Milk and starch", "Cream and sugar"], correct: 1 },
  { question: "Gelato differs from ice cream mainly in its?", choices: ["Temperature", "Color", "Lower fat and denser texture", "Added sugar"], correct: 2 },
  { question: "Tempura is a cooking style from which cuisine?", choices: ["Chinese", "Korean", "Indian", "Japanese"], correct: 3 },
  { question: "Which herb is the main flavoring in pesto sauce?", choices: ["Parsley", "Oregano", "Thyme", "Basil"], correct: 3 },
  { question: "Naan bread is traditionally associated with which cuisine?", choices: ["Middle Eastern", "Indian", "Ethiopian", "Turkish"], correct: 1 },
  { question: "The 'Scoville scale' measures?", choices: ["Wine acidity", "Sugar content", "Spice/heat of peppers", "Salt levels"], correct: 2 },
  { question: "Which country is famous for its fondue dish?", choices: ["France", "Switzerland", "Belgium", "Austria"], correct: 1 },
  { question: "What is tofu made from?", choices: ["Almonds", "Oats", "Soy milk", "Coconut"], correct: 2 },
  { question: "Paella is a traditional dish from which country?", choices: ["Portugal", "Italy", "Spain", "Greece"], correct: 2 },
  { question: "Which cooking method uses dry heat in an enclosed space?", choices: ["Boiling", "Steaming", "Baking", "Poaching"], correct: 2 },
  { question: "Mole sauce is a complex sauce from which country's cuisine?", choices: ["Peru", "Colombia", "Mexico", "Brazil"], correct: 2 },
  { question: "Prosciutto is a type of?", choices: ["Cheese", "Cured ham", "Salami", "Pasta"], correct: 1 },
  { question: "Which fruit is used to make traditional Worcestershire sauce?", choices: ["Tamarind", "Mango", "Papaya", "Anchovy (not a fruit — trick: none)"], correct: 0 },
  { question: "What is the national dish of England?", choices: ["Fish and chips", "Bangers and mash", "Chicken tikka masala", "Yorkshire pudding"], correct: 2 },
  { question: "Umami is often described as which type of taste?", choices: ["Sweet", "Sour", "Bitter", "Savory"], correct: 3 },
  { question: "Which country is the largest producer of tea?", choices: ["India", "China", "Sri Lanka", "Kenya"], correct: 1 },
  { question: "A cronut is a pastry combining a croissant and a?", choices: ["Muffin", "Waffle", "Bagel", "Donut"], correct: 3 },
  { question: "Tahini is a paste made from?", choices: ["Peanuts", "Almonds", "Sesame seeds", "Chickpeas"], correct: 2 },
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
