import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface WarsQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "World War I began in which year?", choices: ["1912", "1914", "1916", "1918"], correct: 1 },
  { question: "The assassination of which Archduke triggered WWI?", choices: ["Franz Joseph I", "Franz Ferdinand", "Karl I", "Otto von Habsburg"], correct: 1 },
  { question: "The Battle of Waterloo ended the reign of?", choices: ["Louis XVI", "Napoleon Bonaparte", "Maximilien Robespierre", "Louis XVIII"], correct: 1 },
  { question: "World War II ended in Europe in which year?", choices: ["1944", "1945", "1946", "1943"], correct: 1 },
  { question: "D-Day landings took place on which beach in Normandy?", choices: ["Juno and Utah only", "Omaha, Utah, Gold, Juno, Sword", "Anzio", "Dunkirk"], correct: 1 },
  { question: "The Korean War ended with an armistice in which year?", choices: ["1950", "1951", "1953", "1955"], correct: 2 },
  { question: "The Trojan War in Greek mythology was sparked by?", choices: ["Land dispute", "Abduction of Helen of Sparta", "Trade rivalry", "Religious conflict"], correct: 1 },
  { question: "The Battle of Hastings in 1066 was fought between?", choices: ["England and France", "Harold II and William the Conqueror", "Vikings and Saxons", "Romans and Britons"], correct: 1 },
  { question: "The Vietnam War primarily ended with which event?", choices: ["Paris Peace Accords 1973 then fall of Saigon 1975", "Ceasefire 1970", "US victory 1972", "UN intervention 1974"], correct: 0 },
  { question: "The Battle of Thermopylae (480 BC) involved which famous group of defenders?", choices: ["100 Athenians", "300 Spartans", "500 Macedonians", "1000 Thebans"], correct: 1 },
  { question: "The Hundred Years War was between which two countries?", choices: ["Spain and Portugal", "England and France", "England and Scotland", "France and Germany"], correct: 1 },
  { question: "Operation Barbarossa was Germany's invasion of which country?", choices: ["France", "Britain", "Soviet Union", "Poland"], correct: 2 },
  { question: "The Gulf War of 1990-91 was triggered by Iraq's invasion of?", choices: ["Iran", "Saudi Arabia", "Kuwait", "Qatar"], correct: 2 },
  { question: "The Battle of Stalingrad was a turning point in?", choices: ["WWI Eastern Front", "WWII Eastern Front", "The Cold War", "The Napoleonic Wars"], correct: 1 },
  { question: "The Peloponnesian War was fought between which city-states?", choices: ["Athens and Corinth", "Athens and Sparta", "Sparta and Thebes", "Athens and Macedon"], correct: 1 },
  { question: "The Seven Years War (1756-63) is sometimes called the first?", choices: ["World War", "European War", "Colonial War", "Industrial War"], correct: 0 },
  { question: "The American Civil War lasted from?", choices: ["1858-1862", "1861-1865", "1863-1867", "1860-1864"], correct: 1 },
  { question: "The Battle of Marathon in 490 BC was a victory for which city?", choices: ["Sparta", "Athens", "Corinth", "Thebes"], correct: 1 },
  { question: "The Crimean War involved which countries?", choices: ["France, Britain, Ottoman Empire vs Russia", "Austria, Prussia vs France", "Britain vs Russia alone", "Russia, France vs Ottoman Empire"], correct: 0 },
  { question: "The Boer Wars were fought in which country?", choices: ["Australia", "India", "South Africa", "Kenya"], correct: 2 },
  { question: "Operation Overlord is the code name for?", choices: ["Battle of Britain", "D-Day invasion of Normandy", "North Africa campaign", "Pacific island hopping"], correct: 1 },
  { question: "The Zulu War of 1879 was between Britain and Zulu Kingdom in modern-day?", choices: ["Zimbabwe", "South Africa", "Mozambique", "Kenya"], correct: 1 },
  { question: "The Falklands War of 1982 was between Britain and?", choices: ["Chile", "Brazil", "Argentina", "Uruguay"], correct: 2 },
  { question: "The Battle of Midway (1942) was a decisive naval victory for?", choices: ["Japan", "USA", "Britain", "Australia"], correct: 1 },
  { question: "The Napoleonic Wars ended in which year?", choices: ["1813", "1814", "1815", "1816"], correct: 2 },
  { question: "WWI's Western Front was characterized by?", choices: ["Mobile cavalry charges", "Trench warfare", "Naval blockades only", "Air superiority"], correct: 1 },
  { question: "The Iran-Iraq War lasted from approximately?", choices: ["1978-1982", "1980-1988", "1982-1990", "1979-1985"], correct: 1 },
  { question: "The Thirty Years War (1618-1648) ended with which treaty?", choices: ["Treaty of Westphalia", "Peace of Augsburg", "Treaty of Utrecht", "Peace of Paris"], correct: 0 },
  { question: "The Battle of El Alamein was fought in which country?", choices: ["Libya", "Egypt", "Tunisia", "Algeria"], correct: 1 },
  { question: "The Sino-Japanese War of 1937-1945 is part of which larger conflict?", choices: ["First World War", "Second World War in Asia (Pacific War)", "Korean War prelude", "Cold War proxy war"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: WarsQuizSettings): WarsQuizState {
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

export function reducer(state: WarsQuizState, action: WarsQuizAction): WarsQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const points = isCorrect ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      return newTime <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      return nextIndex >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: WarsQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
