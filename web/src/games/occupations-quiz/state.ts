import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface OccupationsQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type OccupationsQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface OccupationsQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "A sommelier is an expert in?", choices: ["Cheese", "Wine", "Coffee", "Tea"], correct: 1 },
  { question: "What does an actuary primarily work with?", choices: ["Legal documents", "Financial risk and statistics", "Tax returns", "Property valuations"], correct: 1 },
  { question: "A farrier specializes in?", choices: ["Boat repair", "Glassblowing", "Horseshoe fitting", "Sword forging"], correct: 2 },
  { question: "What is the job of an epidemiologist?", choices: ["Study skin diseases", "Study the spread of disease in populations", "Perform autopsies", "Develop vaccines"], correct: 1 },
  { question: "A cooper traditionally makes?", choices: ["Candles", "Barrels and casks", "Hats", "Rope"], correct: 1 },
  { question: "What does a cartographer create?", choices: ["Cartoons", "Maps", "Charts of music", "Graphs for finance"], correct: 1 },
  { question: "A podiatrist treats conditions of the?", choices: ["Eyes", "Teeth", "Feet", "Ears"], correct: 2 },
  { question: "What does a paleontologist study?", choices: ["Distant planets", "Ancient fossils and life", "Cave paintings", "Glaciers"], correct: 1 },
  { question: "A glazier works with?", choices: ["Ceramics", "Glass", "Metal alloys", "Wax"], correct: 1 },
  { question: "What is the primary role of an ombudsman?", choices: ["Tax collection", "Military command", "Investigating complaints against institutions", "City planning"], correct: 2 },
  { question: "A lapidary works with?", choices: ["Woodwork", "Leather", "Gemstones", "Paper"], correct: 2 },
  { question: "What does an enologist study?", choices: ["Birds", "Wine and winemaking", "Insects", "Oceans"], correct: 1 },
  { question: "A tanner processes?", choices: ["Grain", "Animal hides into leather", "Metal", "Stone"], correct: 1 },
  { question: "What does a stevedore do?", choices: ["Steers ships", "Loads and unloads cargo from ships", "Repairs steam engines", "Tends lighthouses"], correct: 1 },
  { question: "An arborist is an expert in?", choices: ["Rivers", "Trees", "Caves", "Insects"], correct: 1 },
  { question: "What does a cryptographer do?", choices: ["Study crypts and tombs", "Write and decode secret messages", "Study crypt animals", "Count votes"], correct: 1 },
  { question: "A cobbler traditionally?", choices: ["Makes cheese", "Repairs shoes", "Makes wine", "Gathers coal"], correct: 1 },
  { question: "What does an audiologist specialize in?", choices: ["Vision problems", "Hearing and balance disorders", "Voice disorders", "Skin conditions"], correct: 1 },
  { question: "A millwright maintains and repairs?", choices: ["Windmills and mills", "Mining equipment", "Military equipment", "Medical devices"], correct: 0 },
  { question: "What does a hydrologist study?", choices: ["Hydrogen compounds", "Movement and distribution of water", "Hydrothermal vents", "Hypothermia"], correct: 1 },
  { question: "A fletcher traditionally made?", choices: ["Shields", "Arrows", "Helmets", "Bows"], correct: 1 },
  { question: "What does an osteopath focus on?", choices: ["Bones and muscles through manipulation", "Eye surgery", "Nerve disorders", "Skin grafts"], correct: 0 },
  { question: "A chandler historically made or sold?", choices: ["Musical instruments", "Candles", "Chairs", "Chains"], correct: 1 },
  { question: "What is the role of a concierge in a hotel?", choices: ["Manages finances", "Assists guests with services and requests", "Oversees kitchen staff", "Handles security"], correct: 1 },
  { question: "A metallurgist studies?", choices: ["Metals and their properties", "Meteorites", "Meteorology", "Fossils"], correct: 0 },
  { question: "What does a notary public do?", choices: ["Notates music", "Certifies and witnesses legal documents", "Collects taxes", "Patrols borders"], correct: 1 },
  { question: "A costumier designs or makes?", choices: ["Furniture", "Theatrical or historical costumes", "Costumes only for movies", "Children's clothing"], correct: 1 },
  { question: "What does an agronomist study?", choices: ["Agriculture and soil science", "Ancient civilizations", "Crop diseases only", "Water rights"], correct: 0 },
  { question: "A steeplejack works on?", choices: ["Tall structures like steeples and chimneys", "Steel mills", "Bridge foundations", "Steeple interiors only"], correct: 0 },
  { question: "What does a lexicographer compile?", choices: ["Legal codes", "Dictionaries", "Maps", "Encyclopedias"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: OccupationsQuizSettings): OccupationsQuizState {
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

export function reducer(state: OccupationsQuizState, action: OccupationsQuizAction): OccupationsQuizState {
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

export function isTerminal(state: OccupationsQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
