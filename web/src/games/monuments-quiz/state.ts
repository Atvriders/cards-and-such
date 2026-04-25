import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In which country is the Eiffel Tower?", choices: ["Belgium", "Italy", "France", "Spain"], correct: 2 },
  { question: "What is the Great Wall of China built to do?", choices: ["Mark the border", "Defend against invasions from the north", "Show imperial power", "Connect trade routes"], correct: 1 },
  { question: "Where is the Colosseum located?", choices: ["Athens", "Rome", "Istanbul", "Carthage"], correct: 1 },
  { question: "What does the Statue of Liberty represent?", choices: ["American independence", "Freedom and democracy (gift from France)", "Military might", "Industrial revolution"], correct: 1 },
  { question: "Where is the Taj Mahal?", choices: ["Delhi, India", "Agra, India", "Jaipur, India", "Lahore, Pakistan"], correct: 1 },
  { question: "What was the original purpose of Stonehenge?", choices: ["Burial site", "Astronomical calendar / religious site", "Royal palace", "Fortification"], correct: 1 },
  { question: "In which country are the Pyramids of Giza?", choices: ["Sudan", "Libya", "Egypt", "Jordan"], correct: 2 },
  { question: "What is the Acropolis?", choices: ["Roman forum", "Ancient Greek citadel in Athens", "Byzantine palace", "Ottoman fortress"], correct: 1 },
  { question: "Where is the Alhambra?", choices: ["Morocco", "Spain (Granada)", "Portugal", "Algeria"], correct: 1 },
  { question: "What is Machu Picchu?", choices: ["Aztec city", "15th-century Inca citadel in Peru", "Maya temple", "Colombian fortress"], correct: 1 },
  { question: "Where is Angkor Wat?", choices: ["Thailand", "Vietnam", "Cambodia", "Myanmar"], correct: 2 },
  { question: "What is the Parthenon?", choices: ["Roman temple", "Greek temple on the Acropolis dedicated to Athena", "Byzantine church", "Ottoman mosque"], correct: 1 },
  { question: "In which country is Petra?", choices: ["Israel", "Saudi Arabia", "Jordan", "Lebanon"], correct: 2 },
  { question: "What material is the Taj Mahal primarily built from?", choices: ["Limestone", "White marble", "Sandstone", "Granite"], correct: 1 },
  { question: "What is the Sagrada Família?", choices: ["Palace in Madrid", "Unfinished Gaudí cathedral in Barcelona", "Gothic cathedral in Seville", "Roman temple"], correct: 1 },
  { question: "Where is the Sydney Opera House?", choices: ["Melbourne", "Brisbane", "Sydney", "Perth"], correct: 2 },
  { question: "What is the Burj Khalifa?", choices: ["Tallest bridge", "World's tallest building (Dubai)", "Largest mall", "Biggest stadium"], correct: 1 },
  { question: "In which country is the Hagia Sophia?", choices: ["Greece", "Turkey", "Bulgaria", "Armenia"], correct: 1 },
  { question: "Who built the Colosseum?", choices: ["Julius Caesar", "Emperor Vespasian (Flavian dynasty)", "Augustus", "Nero"], correct: 1 },
  { question: "What is the Louvre famous for?", choices: ["Oldest building in Paris", "World's largest art museum", "French royal palace only", "Gothic cathedral"], correct: 1 },
  { question: "Where is the Kremlin?", choices: ["St. Petersburg", "Kiev", "Moscow", "Warsaw"], correct: 2 },
  { question: "What is the Great Barrier Reef?", choices: ["Undersea mountain", "World's largest coral reef system (Australia)", "Pacific island chain", "Ocean trench"], correct: 1 },
  { question: "In which country is Chichen Itza?", choices: ["Guatemala", "Peru", "Mexico", "Colombia"], correct: 2 },
  { question: "What is the Forbidden City?", choices: ["Secret Chinese garden", "Imperial Chinese palace complex in Beijing", "Ancient tomb complex", "Walled Chinese city"], correct: 1 },
  { question: "Where is the Brandenburg Gate?", choices: ["Vienna", "Munich", "Berlin", "Hamburg"], correct: 2 },
  { question: "What is the Colossus of Rhodes?", choices: ["Roman chariot track", "One of the Seven Wonders — giant statue at Rhodes harbor", "Greek amphitheater", "Cretan palace"], correct: 1 },
  { question: "Where is the Tower of London?", choices: ["Central London on the Thames", "Windsor", "Hampton Court", "Greenwich"], correct: 0 },
  { question: "What is the Parthenon frieze famous for?", choices: ["Religious inscriptions", "Detailed marble sculptures of Panathenaic procession", "Battle scenes", "Greek gods portraits"], correct: 1 },
  { question: "What is the Leaning Tower of Pisa?", choices: ["Church tower in Venice", "Freestanding bell tower with famous tilt (Pisa, Italy)", "Roman column", "Medieval fortress"], correct: 1 },
  { question: "Which ancient wonder still stands?", choices: ["Colossus of Rhodes", "Hanging Gardens", "Great Pyramid of Giza", "Lighthouse of Alexandria"], correct: 2 },
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
