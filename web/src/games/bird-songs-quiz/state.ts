import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BirdSongsQuizSettings { questions: "10"; }
export interface BirdSongsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BirdSongsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which bird is famous for its 'chick-a-dee-dee-dee' call?", choices: ["Chickadee", "Robin", "Cardinal", "Sparrow"], correct: 0 },
  { question: "The 'who-cooks-for-you' hooting song belongs to?", choices: ["Great Horned Owl", "Barred Owl", "Snowy Owl", "Screech Owl"], correct: 1 },
  { question: "The flute-like ethereal song of which thrush is iconic?", choices: ["Robin", "Wood Thrush", "Hermit Thrush", "Swainson's Thrush"], correct: 1 },
  { question: "Which bird mimics the calls of many other birds?", choices: ["Mockingbird", "Cardinal", "Bluejay", "Goldfinch"], correct: 0 },
  { question: "The 'cheeseburger' or 'fee-bee' call belongs to?", choices: ["Black-capped Chickadee", "Cardinal", "Bluejay", "Robin"], correct: 0 },
  { question: "The kookaburra's laugh is found natively in?", choices: ["Africa", "Australia", "South America", "India"], correct: 1 },
  { question: "Which bird is known for the 'cheer-up cheerio' song at dawn?", choices: ["Sparrow", "American Robin", "Goldfinch", "Bluejay"], correct: 1 },
  { question: "Northern Cardinal's song is often described as?", choices: ["A flute", "A whip with 'birdy birdy birdy'", "A laugh", "A click"], correct: 1 },
  { question: "The mournful 'who, who-who, who, who' is from?", choices: ["Mourning Dove", "Owl", "Crow", "Raven"], correct: 0 },
  { question: "Which warbler sings 'witchety witchety witchety'?", choices: ["Yellow Warbler", "Common Yellowthroat", "Black-throated Blue", "Magnolia"], correct: 1 },
  { question: "The American Goldfinch's flight call is often described as?", choices: ["per-chick-o-ree", "caw caw", "tea-kettle", "chick-a-dee"], correct: 0 },
  { question: "Whip-poor-will sings its name in which family?", choices: ["Owls", "Nightjars", "Sparrows", "Wrens"], correct: 1 },
  { question: "The Carolina Wren's loud 'tea-kettle tea-kettle' is striking because?", choices: ["It is so loud for its small size", "It sings only at night", "It mimics other birds", "It is in chorus"], correct: 0 },
  { question: "Which raptor's call is often dubbed onto Bald Eagle footage?", choices: ["Red-tailed Hawk", "Falcon", "Owl", "Vulture"], correct: 0 },
  { question: "Ruby-throated Hummingbirds primarily produce sound by?", choices: ["Singing", "Wingbeats and chip notes", "Whistling", "Hooting"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: BirdSongsQuizSettings): BirdSongsQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: BirdSongsQuizState, action: BirdSongsQuizAction): BirdSongsQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      const pts = ok ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      return t <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: t };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: BirdSongsQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
