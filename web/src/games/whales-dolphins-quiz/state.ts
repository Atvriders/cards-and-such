import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WhalesDolphinsQuizSettings { questions: "10"; }
export interface WhalesDolphinsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WhalesDolphinsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest animal ever to have lived?", choices: ["Blue whale", "Sperm whale", "Orca", "Megalodon"], correct: 0 },
  { question: "Whales and dolphins are members of which order?", choices: ["Pinnipedia", "Cetacea", "Sirenia", "Carnivora"], correct: 1 },
  { question: "Cetaceans are divided into baleen whales and?", choices: ["Toothed whales", "Tusked whales", "Sea cows", "Pinnipeds"], correct: 0 },
  { question: "The sperm whale has the largest what of any animal?", choices: ["Brain", "Eye", "Liver", "Heart"], correct: 0 },
  { question: "Orcas are technically a species of?", choices: ["Dolphin", "Whale", "Porpoise", "Shark"], correct: 0 },
  { question: "Bottlenose dolphins use which technique to navigate?", choices: ["Echolocation", "Magnetism", "Sight only", "Smell"], correct: 0 },
  { question: "Narwhals are famous for their?", choices: ["Long tusk", "Black color", "Singing", "Size"], correct: 0 },
  { question: "Humpback whales are known for their?", choices: ["Complex songs", "Tusks", "Hunting in packs", "Living in fresh water"], correct: 0 },
  { question: "Beluga whales live primarily in?", choices: ["Arctic and sub-Arctic waters", "Tropical seas", "Fresh water rivers", "Antarctic only"], correct: 0 },
  { question: "Which dolphin lives in fresh water?", choices: ["Amazon river dolphin", "Bottlenose", "Common dolphin", "Spinner"], correct: 0 },
  { question: "Baleen plates are made of?", choices: ["Keratin", "Bone", "Cartilage", "Teeth enamel"], correct: 0 },
  { question: "Which is the smallest cetacean?", choices: ["Vaquita", "Beluga", "Orca", "Pilot whale"], correct: 0 },
  { question: "Vaquitas live only in?", choices: ["Gulf of California", "Mediterranean", "Indian Ocean", "North Sea"], correct: 0 },
  { question: "Whales breathe through?", choices: ["Gills", "Blowhole", "Mouth only", "Skin"], correct: 1 },
  { question: "A pod refers to a group of?", choices: ["Whales/dolphins", "Fish", "Birds", "Seals"], correct: 0 },
  { question: "Sperm whales hunt at depths up to?", choices: ["100 m", "500 m", "2000+ m", "50 m"], correct: 2 },
  { question: "Killer whale ecotypes (resident, transient) differ in?", choices: ["Diet and behavior", "Size only", "Color only", "Lifespan"], correct: 0 },
  { question: "Dolphin species count is approximately?", choices: ["~10", "~40", "~100", "~5"], correct: 1 },
  { question: "Cetaceans evolved from land mammals related to?", choices: ["Hippos", "Cats", "Bears", "Elephants"], correct: 0 },
  { question: "Spy-hopping is when a whale?", choices: ["Lifts head out of water to look", "Slaps tail", "Sleeps", "Eats"], correct: 0 },
  { question: "A breaching whale?", choices: ["Leaps out of water", "Dives deep", "Sleeps", "Eats krill"], correct: 0 },
  { question: "Krill is the main food of?", choices: ["Blue whale", "Sperm whale", "Orca", "Beluga"], correct: 0 },
  { question: "Bowhead whales can live more than?", choices: ["50 years", "100 years", "200 years", "20 years"], correct: 2 },
  { question: "Porpoises differ from dolphins by having?", choices: ["Smaller bodies and spade-shaped teeth", "No flippers", "No tail", "Larger size"], correct: 0 },
  { question: "Whale songs of humpbacks change over?", choices: ["Years", "Hours", "Decades only", "Never"], correct: 0 },
  { question: "The melon in a dolphin's head is used for?", choices: ["Echolocation focusing", "Smell", "Feeding", "Sight"], correct: 0 },
  { question: "Which extinct cetacean was a top predator with huge teeth?", choices: ["Livyatan", "Megalodon", "Basilosaurus", "Both A and C"], correct: 3 },
  { question: "Cetacean tail is called a?", choices: ["Fluke", "Fin", "Pelvis", "Hoof"], correct: 0 },
  { question: "Whale falls support deep-sea ecosystems for?", choices: ["Decades", "Hours", "A week", "Centuries always"], correct: 0 },
  { question: "Dolphins are known to use?", choices: ["Names (signature whistles)", "Words like humans", "No communication", "Smoke signals"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: WhalesDolphinsQuizSettings): WhalesDolphinsQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: WhalesDolphinsQuizState, action: WhalesDolphinsQuizAction): WhalesDolphinsQuizState {
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

export function isTerminal(state: WhalesDolphinsQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
