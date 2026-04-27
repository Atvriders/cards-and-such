import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AnimalTracksQuizSettings { questions: "10"; }
export interface AnimalTracksQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AnimalTracksQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which animal has a 4-toed paw print with claws often visible?", choices: ["Cat", "Dog", "Deer", "Squirrel"], correct: 1 },
  { question: "Cleft 2-toe (heart-shaped) tracks are characteristic of which animal?", choices: ["Raccoon", "Bear", "Deer", "Coyote"], correct: 2 },
  { question: "5-toed prints with long fingers like tiny human hands belong to?", choices: ["Skunk", "Raccoon", "Beaver", "Mouse"], correct: 1 },
  { question: "A large paw print with 5 toes and prominent claws belongs to?", choices: ["Cougar", "Wolf", "Bear", "Coyote"], correct: 2 },
  { question: "4-toed cat tracks usually do not show claw marks because?", choices: ["Cats are too light", "Cats retract claws", "Tracks are too small", "Cats have no claws"], correct: 1 },
  { question: "Which bird leaves a 3-toed forward + 1 backward (X-shaped) track?", choices: ["Pigeon", "Wild turkey", "Crow", "Robin"], correct: 1 },
  { question: "Pad and 4 toes, no claws, walking in a straight line — likely a?", choices: ["Dog", "Cat", "Fox", "Mouse"], correct: 1 },
  { question: "Webbed tracks near water are often left by a?", choices: ["Otter", "Squirrel", "Raccoon", "Skunk"], correct: 0 },
  { question: "Which animal leaves a tail-drag mark between paw prints?", choices: ["Beaver", "Otter", "Raccoon", "Mouse"], correct: 0 },
  { question: "A coyote's track most resembles which other animal's?", choices: ["Cat", "Bear", "Dog", "Deer"], correct: 2 },
  { question: "Tiny 4-toed front, 5-toed back tracks belong to?", choices: ["Mouse", "Rabbit", "Squirrel", "Chipmunk"], correct: 0 },
  { question: "Rabbit tracks form what pattern?", choices: ["Straight line", "Bounding pairs", "Zigzag", "Single file"], correct: 1 },
  { question: "Moose tracks differ from deer tracks by being?", choices: ["Smaller", "Larger", "Round", "Webbed"], correct: 1 },
  { question: "Bear tracks show how many toes?", choices: ["4", "5", "6", "3"], correct: 1 },
  { question: "A long sliding mark in snow is most likely a?", choices: ["Otter slide", "Fox", "Owl", "Deer"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: AnimalTracksQuizSettings): AnimalTracksQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: AnimalTracksQuizState, action: AnimalTracksQuizAction): AnimalTracksQuizState {
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

export function isTerminal(state: AnimalTracksQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
