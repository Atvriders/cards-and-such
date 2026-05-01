import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpidersQuizSettings { questions: "10"; }
export interface SpidersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpidersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spiders belong to which class?", choices: ["Arachnida", "Insecta", "Crustacea", "Mammalia"], correct: 0 },
  { question: "How many legs do spiders have?", choices: ["6", "8", "10", "12"], correct: 1 },
  { question: "Spider silk is produced from organs called?", choices: ["Spinnerets", "Pedipalps", "Chelicerae", "Mandibles"], correct: 0 },
  { question: "How many body segments do spiders have?", choices: ["1", "2 (cephalothorax & abdomen)", "3", "4"], correct: 1 },
  { question: "Which spider is famous for its red hourglass marking?", choices: ["Black widow", "Brown recluse", "Wolf spider", "Tarantula"], correct: 0 },
  { question: "The brown recluse has a marking shaped like a?", choices: ["Violin", "Hourglass", "Star", "Heart"], correct: 0 },
  { question: "Tarantulas are native to?", choices: ["Many continents (Americas, Africa, Asia)", "Antarctica", "Australia only", "Europe only"], correct: 0 },
  { question: "Which is the largest spider species?", choices: ["Goliath bird-eater", "Black widow", "Brown recluse", "Garden spider"], correct: 0 },
  { question: "Jumping spiders are notable for their?", choices: ["Excellent vision", "Webs", "Venom", "Size"], correct: 0 },
  { question: "Most spiders have how many eyes?", choices: ["2", "6", "8", "10"], correct: 2 },
  { question: "Spider venom is delivered through?", choices: ["Chelicerae (fangs)", "Stinger", "Tail", "Spinnerets"], correct: 0 },
  { question: "A spider's web is made of?", choices: ["Protein silk", "Wax", "Mucus", "Plant fiber"], correct: 0 },
  { question: "Orb weavers create what kind of web?", choices: ["Circular wheel-shaped webs", "Funnels", "Sheets", "Tangles"], correct: 0 },
  { question: "Funnel-web spiders are most dangerous in?", choices: ["Australia", "Greenland", "Iceland", "Antarctica"], correct: 0 },
  { question: "Female black widows sometimes do what after mating?", choices: ["Eat the male", "Die immediately", "Lay no eggs", "Become male"], correct: 0 },
  { question: "Wolf spiders carry their young on their?", choices: ["Back", "Legs", "Web", "Heads"], correct: 0 },
  { question: "A daddy long-legs (cellar spider) is technically a?", choices: ["True spider", "Insect", "Mite", "Crab"], correct: 0 },
  { question: "Harvestmen (opiliones) differ from spiders by?", choices: ["Having one body segment", "Not having legs", "Being insects", "Having shells"], correct: 0 },
  { question: "Spiders breathe through?", choices: ["Book lungs and/or tracheae", "Gills", "Mouth only", "Skin only"], correct: 0 },
  { question: "Trapdoor spiders ambush prey from?", choices: ["Burrows with hinged lids", "Trees", "Webs in air", "Water surface"], correct: 0 },
  { question: "Which spider is known to dive and live underwater?", choices: ["Diving bell spider", "Black widow", "Tarantula", "Brown recluse"], correct: 0 },
  { question: "Spider silk is, by weight, stronger than?", choices: ["Steel", "Aluminum only", "Paper", "Wood"], correct: 0 },
  { question: "A spider that does not spin webs to catch prey is?", choices: ["Wolf spider", "Orb weaver", "Funnel weaver", "Cobweb spider"], correct: 0 },
  { question: "Spider blood (hemolymph) contains which copper-based pigment?", choices: ["Hemocyanin", "Hemoglobin", "Chlorophyll", "Melanin"], correct: 0 },
  { question: "Approximately how many spider species are described?", choices: ["~50,000", "~1,000", "~500", "~1 million"], correct: 0 },
  { question: "Spiderlings disperse by a behavior called?", choices: ["Ballooning", "Swimming", "Burrowing", "Sleeping"], correct: 0 },
  { question: "The pedipalps of male spiders are used for?", choices: ["Mating (sperm transfer)", "Walking only", "Eating only", "Vision"], correct: 0 },
  { question: "Which spider is famous for its bright red back in Australia?", choices: ["Redback", "Sydney funnel-web", "Huntsman", "Wolf spider"], correct: 0 },
  { question: "Huntsman spiders are known for being?", choices: ["Large and fast", "Web-building", "Poisonous to humans usually", "Aquatic"], correct: 0 },
  { question: "Most spider bites in humans are?", choices: ["Harmless or mild", "Always lethal", "Painless and rare", "Always venomous to humans"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: SpidersQuizSettings): SpidersQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: SpidersQuizState, action: SpidersQuizAction): SpidersQuizState {
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

export function isTerminal(state: SpidersQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
