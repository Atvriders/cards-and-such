import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest fish in the ocean?", choices: ["Great white shark", "Whale shark", "Basking shark", "Giant manta ray"], correct: 1 },
  { question: "How do fish breathe underwater?", choices: ["Lungs", "Skin absorption", "Gills", "Both gills and lungs"], correct: 2 },
  { question: "Which fish is known to walk on land?", choices: ["Mudskipper", "Lungfish", "Climbing perch", "All of the above"], correct: 3 },
  { question: "How does a clownfish benefit from sea anemones?", choices: ["Gets food scraps", "Uses them as shelter", "Mutualistic symbiosis", "Lays eggs in them"], correct: 2 },
  { question: "Which fish can generate electric fields?", choices: ["Electric eel", "Electric ray", "Knifefish", "All of the above"], correct: 3 },
  { question: "What is the fastest fish in the ocean?", choices: ["Swordfish", "Mako shark", "Sailfish", "Tuna"], correct: 2 },
  { question: "How do seahorses reproduce unusually?", choices: ["Female carries eggs", "Male gives birth", "External fertilization only", "They are hermaphrodites"], correct: 1 },
  { question: "What is a school of fish?", choices: ["Fish that hunt together", "A synchronized group of fish", "Fish sharing a territory", "Fish raising young"], correct: 1 },
  { question: "Which fish has the longest migration?", choices: ["Atlantic salmon", "European eel", "Arctic tern fish", "Bluefin tuna"], correct: 1 },
  { question: "What is the bony plate covering a fish's gills called?", choices: ["Operculum", "Lateral line", "Fin ray", "Scale plate"], correct: 0 },
  { question: "Which fish can inflate itself as defense?", choices: ["Lionfish", "Pufferfish", "Stonefish", "Toadfish"], correct: 1 },
  { question: "What organ helps fish control buoyancy?", choices: ["Liver", "Kidney", "Swim bladder", "Spleen"], correct: 2 },
  { question: "Which is the smallest fish in the world?", choices: ["Dwarf pygmy goby", "Paedocypris", "Stout infantfish", "Photocorynus spiniceps"], correct: 1 },
  { question: "How do sharks detect blood in water?", choices: ["Eyes", "Lateral line", "Olfactory system", "Ampullae of Lorenzini"], correct: 2 },
  { question: "What is caviar?", choices: ["Fish eggs (roe)", "Fish liver paste", "Salted fish", "Fish fat"], correct: 0 },
  { question: "Which fish is anadromous?", choices: ["Trout", "Atlantic salmon", "Steelhead", "All of the above"], correct: 3 },
  { question: "How many chambers does a fish heart have?", choices: ["2", "3", "4", "1"], correct: 0 },
  { question: "What is the lateral line used for?", choices: ["Breathing", "Detecting water movement and pressure", "Navigation only", "Communication"], correct: 1 },
  { question: "Which fish is considered a living fossil?", choices: ["Coelacanth", "Lungfish", "Sturgeon", "Paddlefish"], correct: 0 },
  { question: "What percentage of fish species live in freshwater?", choices: ["10%", "25%", "41%", "50%"], correct: 2 },
  { question: "How do anglerfish attract prey in the deep sea?", choices: ["Electric pulses", "Bioluminescent lure", "Sound", "Scent"], correct: 1 },
  { question: "Which fish has the most toxic flesh?", choices: ["Stonefish", "Fugu (pufferfish)", "Lionfish", "Blowfish"], correct: 1 },
  { question: "What are fish scales made of?", choices: ["Bone", "Keratin", "Calcium carbonate and protein", "Chitin"], correct: 2 },
  { question: "Which type of fish is a piranha?", choices: ["Marine predator", "Freshwater carnivore", "Deep sea fish", "Estuarine fish"], correct: 1 },
  { question: "How do tuna maintain high body temperature?", choices: ["External heat sources", "Countercurrent heat exchange", "Metabolic rate only", "Basking"], correct: 1 },
  { question: "Which fish is the basis of most fish and chips?", choices: ["Pollock", "Cod", "Haddock", "Both cod and haddock"], correct: 3 },
  { question: "What is ichthyology?", choices: ["Study of birds", "Study of fish", "Study of reptiles", "Study of amphibians"], correct: 1 },
  { question: "Which fish can see infrared light?", choices: ["Goldfish", "Piranha", "Some salmon species", "Electric eel"], correct: 2 },
  { question: "What color is a goldfish in the dark?", choices: ["Stays gold", "Turns white/pale", "Turns silver", "No change"], correct: 1 },
  { question: "Which ocean has the greatest fish diversity?", choices: ["Atlantic", "Pacific", "Indian", "Coral Triangle region"], correct: 3 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
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
    case "select": if (state.submitted) return state; return { ...state, selected: action.choice };
    case "submit": { if (state.submitted || state.selected === null) return state; const q = state.questions[state.currentIndex]!; const ok = state.selected === q.correct; return { ...state, submitted: true, score: state.score + (ok ? 100 + Math.floor(state.timeLeft * 10) : 0), correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" }; }
    case "tick": { if (state.submitted) return state; const t = state.timeLeft - 1; if (t <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" }; return { ...state, timeLeft: t }; }
    case "next": { const n = state.currentIndex + 1; if (n >= state.questions.length) return { ...state, phase: "done" }; return { ...state, currentIndex: n, selected: null, submitted: false, timeLeft: 15, phase: "playing" }; }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
