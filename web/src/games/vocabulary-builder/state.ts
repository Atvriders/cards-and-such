import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VocabularyBuilderSettings { questions: "8" | "12"; }
export interface VocabularyBuilderState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VocabularyBuilderAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Ephemeral' means:", choices: ["lasting forever","short-lived","very loud","extremely cold"], correct: 1 },
  { question: "'Garrulous' means:", choices: ["silent","talkative","wealthy","lazy"], correct: 1 },
  { question: "'Lucid' means:", choices: ["confused","clear/easily understood","tasty","vibrant"], correct: 1 },
  { question: "'Pernicious' means:", choices: ["beneficial","harmful","amusing","calm"], correct: 1 },
  { question: "'Sycophant' means:", choices: ["a flatterer","a doctor","a thief","a writer"], correct: 0 },
  { question: "'Mitigate' means:", choices: ["increase","alleviate/lessen","destroy","ignore"], correct: 1 },
  { question: "'Egregious' means:", choices: ["small","outstandingly bad","mild","sweet"], correct: 1 },
  { question: "'Ubiquitous' means:", choices: ["rare","everywhere","ancient","strange"], correct: 1 },
  { question: "'Cacophony' means:", choices: ["harmony","harsh sound","silence","melody"], correct: 1 },
  { question: "'Quixotic' means:", choices: ["practical","unrealistically idealistic","cold","fast"], correct: 1 },
  { question: "'Laconic' means:", choices: ["wordy","using few words","loud","late"], correct: 1 },
  { question: "'Obfuscate' means:", choices: ["clarify","make unclear","build","shrink"], correct: 1 },
  { question: "'Sagacious' means:", choices: ["foolish","wise","tired","quick"], correct: 1 },
  { question: "'Erudite' means:", choices: ["learned/scholarly","silly","sad","brief"], correct: 0 },
  { question: "'Benevolent' means:", choices: ["cruel","kind/well-meaning","lazy","rich"], correct: 1 },
  { question: "'Capricious' means:", choices: ["steady","impulsive/changeable","calm","wise"], correct: 1 },
  { question: "'Diligent' means:", choices: ["lazy","hardworking","noisy","weak"], correct: 1 },
  { question: "'Eloquent' means:", choices: ["awkward","fluent/persuasive","quiet","rude"], correct: 1 },
  { question: "'Frugal' means:", choices: ["wasteful","thrifty","rich","lazy"], correct: 1 },
  { question: "'Gregarious' means:", choices: ["shy","sociable","angry","tired"], correct: 1 },
  { question: "'Hackneyed' means:", choices: ["fresh","overused/cliched","exotic","bold"], correct: 1 },
  { question: "'Impetuous' means:", choices: ["careful","rash/impulsive","calm","wise"], correct: 1 },
  { question: "'Juxtapose' means:", choices: ["separate widely","place side by side","destroy","duplicate"], correct: 1 },
  { question: "'Mellifluous' means:", choices: ["harsh","sweet-sounding","silent","fast"], correct: 1 },
  { question: "'Nefarious' means:", choices: ["honest","wicked/evil","shy","playful"], correct: 1 },
  { question: "'Ostentatious' means:", choices: ["modest","showy/pretentious","plain","private"], correct: 1 },
  { question: "'Pragmatic' means:", choices: ["theoretical","practical","lazy","wild"], correct: 1 },
  { question: "'Recalcitrant' means:", choices: ["obedient","stubbornly resistant","kind","happy"], correct: 1 },
  { question: "'Tenacious' means:", choices: ["weak","persistent","lazy","brief"], correct: 1 },
  { question: "'Vehement' means:", choices: ["mild","intensely passionate","calm","quiet"], correct: 1 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VocabularyBuilderSettings): VocabularyBuilderState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const nc = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: nc };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: VocabularyBuilderState, action: VocabularyBuilderAction): VocabularyBuilderState {
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
export function isTerminal(state: VocabularyBuilderState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
