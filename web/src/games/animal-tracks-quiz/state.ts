import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AnimalTracksQuizSettings { questions: "10"; }
export interface AnimalTracksQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AnimalTracksQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which animal leaves tracks with 4 toes and visible claws?", choices: ["Domestic cat", "Coyote", "Bobcat", "Lynx"], correct: 1 },
  { question: "Cat tracks typically show how many toe pads in the print?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "A heart-shaped track with two cleaves is left by?", choices: ["Bear", "Deer", "Raccoon", "Skunk"], correct: 1 },
  { question: "Raccoon tracks resemble tiny what?", choices: ["Dog paws", "Human hands", "Bird feet", "Hooves"], correct: 1 },
  { question: "Bear tracks show how many toes?", choices: ["4", "5", "6", "3"], correct: 1 },
  { question: "Which canid track is largest in North America?", choices: ["Fox", "Coyote", "Gray wolf", "Domestic dog"], correct: 2 },
  { question: "Moose tracks are larger than which other deer family member?", choices: ["Elk", "Caribou", "White-tailed deer", "All of these"], correct: 3 },
  { question: "Opossum tracks show a distinctive thumb-like toe on the?", choices: ["Front foot", "Hind foot", "Both feet", "Neither"], correct: 1 },
  { question: "Birds with three forward toes and one back are classified as?", choices: ["Zygodactyl", "Anisodactyl", "Syndactyl", "Pamprodactyl"], correct: 1 },
  { question: "A hopping gait with paired tracks is typical of?", choices: ["Deer", "Rabbits and squirrels", "Bears", "Cats"], correct: 1 },
  { question: "Which animal has webbing visible between toes in tracks?", choices: ["Beaver", "Squirrel", "Fox", "Mouse"], correct: 0 },
  { question: "Cougar tracks are distinguished from dog tracks by?", choices: ["Visible claws", "No visible claws", "Five toes", "Square shape"], correct: 1 },
  { question: "Elk tracks are similar to deer but?", choices: ["Smaller", "Larger and more rounded", "Triangular", "Have claws"], correct: 1 },
  { question: "Otter tracks often appear alongside what feature?", choices: ["Slide marks in mud or snow", "Burrows", "Scratch posts", "Nests"], correct: 0 },
  { question: "Wild turkey tracks span roughly how wide?", choices: ["1 inch", "4 inches", "10 inches", "15 inches"], correct: 1 },
  { question: "Which rodent leaves a tail drag mark between footprints?", choices: ["Squirrel", "Mouse", "Beaver", "All of these often"], correct: 3 },
  { question: "A direct register gait, where hind foot lands in front print, is typical of?", choices: ["Foxes and cats", "Bears", "Rabbits", "Skunks"], correct: 0 },
  { question: "Skunk tracks show how many toes on each foot?", choices: ["4", "5", "6", "3"], correct: 1 },
  { question: "Coyote tracks are typically more oval than domestic dog tracks, which are?", choices: ["More square/rounded", "Identical", "Triangular", "Hexagonal"], correct: 0 },
  { question: "Beaver tracks are often obscured by?", choices: ["Tail drag", "Snow", "Other tracks", "Webbing alone"], correct: 0 },
  { question: "Bobcat tracks are roughly what size?", choices: ["1 inch", "2 inches", "4 inches", "6 inches"], correct: 1 },
  { question: "A bounding gait creating four-print clusters is common in?", choices: ["Weasels and mink", "Deer", "Bears", "Cats"], correct: 0 },
  { question: "Which animal leaves a large round front track with five long claws?", choices: ["Badger", "Skunk", "Marmot", "Porcupine"], correct: 0 },
  { question: "Wild pig (boar) tracks resemble deer but have?", choices: ["Round dewclaws set wider", "No dewclaws", "Three toes", "Webbing"], correct: 0 },
  { question: "Snowshoe hare tracks are notable for?", choices: ["Tiny size", "Huge hind feet", "Webbed toes", "Five toes"], correct: 1 },
  { question: "Mountain lion track size is approximately?", choices: ["1 inch", "3-4 inches", "6-8 inches", "10 inches"], correct: 1 },
  { question: "Which bird has zygodactyl (2 forward, 2 back) tracks?", choices: ["Robin", "Owl or woodpecker", "Crow", "Sparrow"], correct: 1 },
  { question: "Tracking term for the distance between successive prints is?", choices: ["Stride", "Straddle", "Gait", "Register"], correct: 0 },
  { question: "Tracking term for width between left and right prints is?", choices: ["Stride", "Straddle", "Trot", "Pace"], correct: 1 },
  { question: "Best substrate for finding clear tracks is usually?", choices: ["Dry leaves", "Mud or fresh snow", "Rocky terrain", "Tall grass"], correct: 1 },
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
