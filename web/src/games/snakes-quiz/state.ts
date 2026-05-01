import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SnakesQuizSettings { questions: "10"; }
export interface SnakesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SnakesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The longest snake species is the?", choices: ["Reticulated python", "King cobra", "Anaconda", "Mamba"], correct: 0 },
  { question: "The heaviest snake species is the?", choices: ["Green anaconda", "Reticulated python", "King cobra", "Boa constrictor"], correct: 0 },
  { question: "The longest venomous snake is the?", choices: ["King cobra", "Black mamba", "Taipan", "Bushmaster"], correct: 0 },
  { question: "Which snake is known as the fastest land snake?", choices: ["Black mamba", "Cobra", "Viper", "Boa"], correct: 0 },
  { question: "Rattlesnakes use their rattles to?", choices: ["Warn predators", "Attract prey", "Sense heat", "Cool off"], correct: 0 },
  { question: "Pit vipers detect prey using?", choices: ["Heat-sensing pits", "Sound", "Magnetism", "Sight only"], correct: 0 },
  { question: "Snakes smell with their?", choices: ["Tongue (Jacobson's organ)", "Nose only", "Skin", "Eyes"], correct: 0 },
  { question: "A snake's scales are made of?", choices: ["Keratin", "Bone", "Cartilage", "Mucus"], correct: 0 },
  { question: "Constrictors kill prey by?", choices: ["Suffocation/cardiac arrest", "Venom", "Crushing bones", "Drowning"], correct: 0 },
  { question: "Which snake spits venom?", choices: ["Spitting cobra", "Anaconda", "Boa", "Garter snake"], correct: 0 },
  { question: "Sea snakes are most diverse in?", choices: ["Indo-Pacific", "Atlantic", "Arctic", "Mediterranean"], correct: 0 },
  { question: "The inland taipan has the most toxic venom of any?", choices: ["Land snake", "Sea creature", "Insect", "Lizard"], correct: 0 },
  { question: "Which family includes coral snakes and cobras?", choices: ["Elapidae", "Viperidae", "Colubridae", "Boidae"], correct: 0 },
  { question: "\"Red touches yellow\" warns of which snake in North America?", choices: ["Coral snake", "Rattlesnake", "Cottonmouth", "Hognose"], correct: 0 },
  { question: "Cottonmouths are also called?", choices: ["Water moccasins", "Copperheads", "Cobras", "Boas"], correct: 0 },
  { question: "Garter snakes are known for?", choices: ["Wide range and harmless nature", "Deadly venom", "Huge size", "Living in deserts only"], correct: 0 },
  { question: "Hognose snakes famously?", choices: ["Play dead", "Spit venom", "Glow", "Burrow only"], correct: 0 },
  { question: "Snakes shed their skin in a process called?", choices: ["Ecdysis", "Molting", "Sloughing", "All terms used"], correct: 3 },
  { question: "How many species of snakes exist (approx.)?", choices: ["~3,900", "~50", "~500", "~10,000"], correct: 0 },
  { question: "Snakes evolved from?", choices: ["Lizards", "Crocodiles", "Birds", "Fish"], correct: 0 },
  { question: "Which continent has no native snakes?", choices: ["Antarctica", "Africa", "Asia", "South America"], correct: 0 },
  { question: "Boas are different from pythons in that boas typically?", choices: ["Give live birth", "Lay eggs", "Spit venom", "Have legs"], correct: 0 },
  { question: "A baby snake is called a?", choices: ["Snakelet, hatchling, or neonate", "Kit", "Pup", "Joey"], correct: 0 },
  { question: "Cobras intimidate by spreading their?", choices: ["Hood", "Tail", "Wings", "Fangs"], correct: 0 },
  { question: "Bushmasters are the longest viper in the?", choices: ["Americas", "Africa", "Asia", "Europe"], correct: 0 },
  { question: "The Gaboon viper is famous for having?", choices: ["Longest fangs of any snake", "Wings", "Legs", "Two heads usually"], correct: 0 },
  { question: "Anti-venom is produced from?", choices: ["Animal antibodies after envenomation", "Plant extracts only", "Pure water", "Salt"], correct: 0 },
  { question: "Which snake is sacred in some Hindu traditions?", choices: ["Cobra", "Python", "Rattlesnake", "Boa"], correct: 0 },
  { question: "Dendroaspis is the genus of?", choices: ["Mambas", "Cobras", "Vipers", "Boas"], correct: 0 },
  { question: "Snakes are ectothermic, meaning they?", choices: ["Rely on external heat", "Generate own heat", "Live in water only", "Don't need food"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: SnakesQuizSettings): SnakesQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: SnakesQuizState, action: SnakesQuizAction): SnakesQuizState {
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

export function isTerminal(state: SnakesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
