import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PrimatesQuizSettings { questions: "10"; }
export interface PrimatesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PrimatesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the largest primate species?", choices: ["Chimpanzee", "Gorilla", "Orangutan", "Bonobo"], correct: 1 },
  { question: "Closest living relatives to humans are?", choices: ["Gorillas", "Chimpanzees and bonobos", "Orangutans", "Gibbons"], correct: 1 },
  { question: "Lemurs are native exclusively to?", choices: ["Africa", "Madagascar", "Asia", "Australia"], correct: 1 },
  { question: "Orangutans are native to?", choices: ["Africa", "South America", "Borneo and Sumatra", "Madagascar"], correct: 2 },
  { question: "A key difference between monkeys and apes is?", choices: ["Apes are larger", "Apes lack tails", "Apes only live in Africa", "Apes are nocturnal"], correct: 1 },
  { question: "Bonobos are known for their?", choices: ["Aggression", "Peaceful, matriarchal society", "Tool use only", "Solitary lifestyle"], correct: 1 },
  { question: "Tarsiers are unique for their?", choices: ["Long tails", "Huge eyes", "Striped fur", "Wing flaps"], correct: 1 },
  { question: "Spider monkeys use their tail as a?", choices: ["Weapon", "Fifth limb (prehensile)", "Display", "Heat regulator"], correct: 1 },
  { question: "Mountain gorillas live in?", choices: ["Congo, Rwanda, Uganda", "West Africa", "Madagascar", "Asia"], correct: 0 },
  { question: "Howler monkeys are famous for?", choices: ["Speed", "Their loud calls", "Climbing only", "Color"], correct: 1 },
  { question: "Macaques are native to?", choices: ["Asia mainly", "Africa only", "Americas", "Europe"], correct: 0 },
  { question: "Old World monkeys differ from New World by having?", choices: ["Prehensile tails", "Non-prehensile tails", "Larger size only", "Brighter colors"], correct: 1 },
  { question: "Mandrills are famous for their?", choices: ["Long tails", "Brightly colored faces", "Speed", "Tool use"], correct: 1 },
  { question: "Aye-aye is a famous?", choices: ["Lemur", "Chimp", "Bonobo", "Tarsier"], correct: 0 },
  { question: "Jane Goodall is most known for studying?", choices: ["Gorillas", "Chimpanzees", "Bonobos", "Orangutans"], correct: 1 },
  { question: "Dian Fossey famously studied?", choices: ["Mountain gorillas", "Chimpanzees", "Orangutans", "Lemurs"], correct: 0 },
  { question: "Birutė Galdikas is known for studying?", choices: ["Orangutans", "Lemurs", "Gibbons", "Macaques"], correct: 0 },
  { question: "Gibbons are classified as?", choices: ["Lesser apes", "Great apes", "Old World monkeys", "Prosimians"], correct: 0 },
  { question: "Apes lack which feature found in monkeys?", choices: ["Tails", "Opposable thumbs", "Color vision", "Fingers"], correct: 0 },
  { question: "The proboscis monkey is known for its?", choices: ["Large nose", "Striped fur", "Hairless tail", "Webbed feet"], correct: 0 },
  { question: "Capuchin monkeys are commonly known as?", choices: ["Organ grinder monkeys", "Bald monkeys", "Saki monkeys", "Marmosets"], correct: 0 },
  { question: "The smallest monkey is the?", choices: ["Pygmy marmoset", "Tamarin", "Capuchin", "Squirrel monkey"], correct: 0 },
  { question: "Silverback refers to a mature male?", choices: ["Gorilla", "Chimpanzee", "Orangutan", "Baboon"], correct: 0 },
  { question: "Baboons live in groups called?", choices: ["Troops", "Bands only", "Prides", "Packs"], correct: 0 },
  { question: "Ring-tailed lemurs are easily recognized by their?", choices: ["Black and white striped tail", "Red fur", "Naked face", "Tusks"], correct: 0 },
  { question: "Chimpanzees are known to use?", choices: ["Tools", "Fire", "Wheels", "Pottery"], correct: 0 },
  { question: "Most primates are characterized by?", choices: ["Forward-facing eyes and grasping hands", "Wings", "Hooves", "Scales"], correct: 0 },
  { question: "Orangutan means \"person of the?", choices: ["Forest\"", "Mountain\"", "River\"", "Sea\""], correct: 0 },
  { question: "A group of lemurs is called a?", choices: ["Conspiracy or troop", "Pride", "Herd", "Pod"], correct: 0 },
  { question: "Bonobos and chimpanzees diverged about how long ago?", choices: ["1-2 million years", "50,000 years", "20 million years", "500 years"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: PrimatesQuizSettings): PrimatesQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: PrimatesQuizState, action: PrimatesQuizAction): PrimatesQuizState {
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

export function isTerminal(state: PrimatesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
