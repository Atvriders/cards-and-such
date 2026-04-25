import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface HerbsQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type HerbsQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface HerbsQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which herb is known as 'the king of herbs'?", choices: ["Rosemary", "Basil", "Thyme", "Oregano"], correct: 1 },
  { question: "Lavender belongs to which plant family?", choices: ["Rosaceae", "Lamiaceae (mint)", "Asteraceae", "Apiaceae"], correct: 1 },
  { question: "Which herb is traditionally used to aid digestion?", choices: ["Sage", "Peppermint", "Dill", "Tarragon"], correct: 1 },
  { question: "Saffron is derived from which part of the crocus flower?", choices: ["Petals", "Stamens", "Stigmas", "Sepals"], correct: 2 },
  { question: "Which herb is used in making pesto?", choices: ["Parsley", "Basil", "Cilantro", "Mint"], correct: 1 },
  { question: "Chamomile tea is made from which part of the plant?", choices: ["Leaves", "Stems", "Flowers", "Roots"], correct: 2 },
  { question: "Which herb has the Latin name 'Rosmarinus officinalis'?", choices: ["Thyme", "Lavender", "Rosemary", "Sage"], correct: 2 },
  { question: "Cilantro and coriander come from the same plant. Which part is cilantro?", choices: ["Seeds", "Roots", "Leaves and stems", "Flowers"], correct: 2 },
  { question: "Which herb is associated with remembrance?", choices: ["Sage", "Rosemary", "Thyme", "Mint"], correct: 1 },
  { question: "Echinacea is used in herbal medicine mainly as?", choices: ["A sleep aid", "An immune booster", "A pain reliever", "A digestive aid"], correct: 1 },
  { question: "Which herb flavors the spirit gin?", choices: ["Juniper berries", "Anise", "Fennel", "Caraway"], correct: 0 },
  { question: "Tarragon is a key herb in which national cuisine?", choices: ["Italian", "French", "Greek", "Spanish"], correct: 1 },
  { question: "Which herb is used to make the liqueur absinthe?", choices: ["Sage", "Wormwood", "Hyssop", "Rue"], correct: 1 },
  { question: "What flavor does dill primarily impart?", choices: ["Sweet floral", "Anise-like", "Fresh grassy", "Bitter citrus"], correct: 2 },
  { question: "Which herb is known for repelling mosquitoes naturally?", choices: ["Parsley", "Basil", "Lemon balm", "Chervil"], correct: 2 },
  { question: "St. John's Wort is used in herbal medicine for?", choices: ["Joint pain", "Mood and depression support", "Skin healing", "Liver detox"], correct: 1 },
  { question: "Which herb is commonly added to Thai cooking for a citrus note?", choices: ["Lemongrass", "Thai basil", "Kaffir lime leaves", "Galangal"], correct: 2 },
  { question: "The active compound in turmeric responsible for its color is?", choices: ["Capsaicin", "Curcumin", "Quercetin", "Piperine"], correct: 1 },
  { question: "Which herb is also called 'bee balm'?", choices: ["Lemon balm", "Bergamot", "Borage", "Monarda"], correct: 3 },
  { question: "Valerian root is used primarily as a?", choices: ["Stimulant", "Sedative and sleep aid", "Digestive", "Diuretic"], correct: 1 },
  { question: "Which herb flavors Earl Grey tea?", choices: ["Jasmine", "Bergamot", "Lavender", "Rose"], correct: 1 },
  { question: "Which part of the fennel plant is NOT edible?", choices: ["Bulb", "Fronds", "Seeds", "All parts are edible"], correct: 3 },
  { question: "Which herb has been used for over 5,000 years and is native to the Mediterranean?", choices: ["Thyme", "Sage", "Oregano", "Basil"], correct: 1 },
  { question: "Ginseng root is particularly popular in which medicine tradition?", choices: ["Ayurvedic", "Traditional Chinese Medicine", "Native American", "Unani"], correct: 1 },
  { question: "Which herb is used to season lamb in British cooking?", choices: ["Sage", "Rosemary", "Mint", "Thyme"], correct: 2 },
  { question: "Aloe vera gel is used mainly for?", choices: ["Cooking flavoring", "Skin soothing and burns", "Tea making", "Spice blending"], correct: 1 },
  { question: "Which herb has silvery-green leaves and strong antiseptic properties?", choices: ["Thyme", "Sage", "Oregano", "Marjoram"], correct: 1 },
  { question: "Which herb is a natural source of iron and used widely in Indian cuisine?", choices: ["Methi (fenugreek)", "Curry leaves", "Asafoetida", "Ajwain"], correct: 0 },
  { question: "Which herb gives béarnaise sauce its distinctive anise flavor?", choices: ["Dill", "Tarragon", "Chervil", "Fennel fronds"], correct: 1 },
  { question: "Witch hazel is extracted from which part of the plant?", choices: ["Flowers", "Leaves and bark", "Roots only", "Seeds"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: HerbsQuizSettings): HerbsQuizState {
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

export function reducer(state: HerbsQuizState, action: HerbsQuizAction): HerbsQuizState {
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

export function isTerminal(state: HerbsQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
