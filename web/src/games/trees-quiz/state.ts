import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface TreesQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TreesQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface TreesQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which tree is the tallest species on Earth?", choices: ["Giant sequoia", "Coast redwood", "Douglas fir", "Sitka spruce"], correct: 1 },
  { question: "Which tree produces acorns?", choices: ["Maple", "Beech", "Oak", "Birch"], correct: 2 },
  { question: "The baobab tree is famous for storing water in its?", choices: ["Leaves", "Roots", "Trunk", "Bark"], correct: 2 },
  { question: "Which tree is the national tree of Canada?", choices: ["Pine", "Maple", "Spruce", "Birch"], correct: 1 },
  { question: "What is the oldest individual tree species known to survive?", choices: ["Bristlecone pine", "Giant sequoia", "Olive", "Yew"], correct: 0 },
  { question: "Which tree is used to make cricket bats?", choices: ["Ash", "Willow", "Oak", "Teak"], correct: 1 },
  { question: "The Amazon rainforest is sometimes called the 'lungs of Earth' because trees?", choices: ["Absorb water", "Produce oxygen", "Store carbon underground", "Generate rain"], correct: 1 },
  { question: "Which deciduous tree turns bright red in autumn?", choices: ["Silver birch", "Beech", "Red maple", "Larch"], correct: 2 },
  { question: "Which tree has white bark that peels in papery sheets?", choices: ["Aspen", "Paper birch", "Ash", "Poplar"], correct: 1 },
  { question: "The coconut palm is classified as which type of plant?", choices: ["Tree", "Grass", "Shrub", "Fern"], correct: 0 },
  { question: "Which tree produces sap used for maple syrup?", choices: ["Red maple", "Sugar maple", "Silver maple", "Norway maple"], correct: 1 },
  { question: "What does 'conifer' mean?", choices: ["Cone-bearing", "Evergreen only", "Needle-leaved", "Resin-producing"], correct: 0 },
  { question: "Which tree is the symbol of peace?", choices: ["Oak", "Olive", "Cedar", "Palm"], correct: 1 },
  { question: "The giant sequoia holds which record?", choices: ["Tallest tree", "Largest tree by volume", "Oldest living tree", "Widest trunk"], correct: 1 },
  { question: "Which tree loses its leaves in winter?", choices: ["Pine", "Spruce", "Maple", "Cedar"], correct: 2 },
  { question: "Ebony wood is prized for being?", choices: ["Very light", "Very dark and hard", "Very flexible", "Naturally waterproof"], correct: 1 },
  { question: "Which country has the most forest coverage by percentage?", choices: ["Russia", "Brazil", "Finland", "Suriname"], correct: 3 },
  { question: "The weeping willow is named for its?", choices: ["Thin bark", "Drooping branches", "Pale color", "Small leaves"], correct: 1 },
  { question: "Rubber is extracted from which tree?", choices: ["Teak", "Mahogany", "Para rubber tree", "Balsa"], correct: 2 },
  { question: "Which tree is sacred in Buddhism?", choices: ["Banyan", "Bodhi fig", "Teak", "Sal"], correct: 1 },
  { question: "How do trees communicate with each other underground?", choices: ["Root chemicals", "Mycorrhizal fungi networks", "Electrical signals", "Root touch"], correct: 1 },
  { question: "What is dendrochronology?", choices: ["Study of tree diseases", "Dating using tree rings", "Growing trees in labs", "Tree classification"], correct: 1 },
  { question: "Which tree produces the lightest commercial wood?", choices: ["Bamboo", "Balsa", "Poplar", "Willow"], correct: 1 },
  { question: "Mangrove trees grow in?", choices: ["Deserts", "High mountains", "Coastal saltwater areas", "Arctic tundra"], correct: 2 },
  { question: "Which tree is used to make wine barrels?", choices: ["Beech", "Oak", "Ash", "Walnut"], correct: 1 },
  { question: "The dragon blood tree is native to?", choices: ["Madagascar", "Socotra island", "Borneo", "Canary Islands"], correct: 1 },
  { question: "What is the study of trees called?", choices: ["Dendrology", "Botany", "Arboriculture", "Silviculture"], correct: 0 },
  { question: "Which tree can live over 5,000 years?", choices: ["Oak", "Bristlecone pine", "Giant sequoia", "Olive"], correct: 1 },
  { question: "What is a tree's cambium layer?", choices: ["The heartwood core", "A growth layer under bark", "The root cap", "The topmost leaves"], correct: 1 },
  { question: "Which type of tree sheds all its leaves seasonally?", choices: ["Evergreen", "Deciduous", "Coniferous", "Tropical"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: TreesQuizSettings): TreesQuizState {
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

export function reducer(state: TreesQuizState, action: TreesQuizAction): TreesQuizState {
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

export function isTerminal(state: TreesQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
