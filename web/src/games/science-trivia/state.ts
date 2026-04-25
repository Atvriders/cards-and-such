import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type QuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface QuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the atomic number of carbon?", choices: ["4", "6", "8", "12"], correct: 1 },
  { question: "Which scientist proposed the theory of general relativity?", choices: ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Max Planck"], correct: 2 },
  { question: "What is the hardest natural substance on Earth?", choices: ["Quartz", "Corundum", "Topaz", "Diamond"], correct: 3 },
  { question: "The human genome contains approximately how many genes?", choices: ["2,000", "20,000", "200,000", "2,000,000"], correct: 1 },
  { question: "Which force keeps planets in orbit around the Sun?", choices: ["Electromagnetic force", "Strong nuclear force", "Weak nuclear force", "Gravity"], correct: 3 },
  { question: "What is the chemical formula for table salt?", choices: ["NaOH", "KCl", "NaCl", "MgCl2"], correct: 2 },
  { question: "Which organ in the human body produces bile?", choices: ["Pancreas", "Kidney", "Gallbladder", "Liver"], correct: 3 },
  { question: "What is the speed of sound in air at sea level (approximately)?", choices: ["343 m/s", "433 m/s", "543 m/s", "643 m/s"], correct: 0 },
  { question: "Which planet has the most moons?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1 },
  { question: "What branch of science studies living organisms?", choices: ["Chemistry", "Physics", "Biology", "Geology"], correct: 2 },
  { question: "The process by which plants make food using sunlight is called?", choices: ["Respiration", "Transpiration", "Fermentation", "Photosynthesis"], correct: 3 },
  { question: "Electrons have which charge?", choices: ["Positive", "Neutral", "Negative", "Variable"], correct: 2 },
  { question: "What is the unit of electrical resistance?", choices: ["Volt", "Ampere", "Watt", "Ohm"], correct: 3 },
  { question: "Which gas do humans exhale?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
  { question: "DNA is found in which part of the cell?", choices: ["Cell membrane", "Cytoplasm", "Ribosome", "Nucleus"], correct: 3 },
  { question: "What is the most abundant element in the universe?", choices: ["Helium", "Oxygen", "Carbon", "Hydrogen"], correct: 3 },
  { question: "Which scientist discovered penicillin?", choices: ["Louis Pasteur", "Joseph Lister", "Alexander Fleming", "Robert Koch"], correct: 2 },
  { question: "The study of earthquakes is called?", choices: ["Volcanology", "Meteorology", "Seismology", "Geology"], correct: 2 },
  { question: "What is the approximate age of the universe?", choices: ["4.5 billion years", "10 billion years", "13.8 billion years", "20 billion years"], correct: 2 },
  { question: "Mitosis produces how many daughter cells?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Which vitamin is produced when skin is exposed to sunlight?", choices: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correct: 3 },
  { question: "Absolute zero is approximately?", choices: ["-173°C", "-273°C", "-373°C", "-473°C"], correct: 1 },
  { question: "What is the chemical symbol for iron?", choices: ["Ir", "In", "Fe", "Fo"], correct: 2 },
  { question: "Which type of radiation has the shortest wavelength?", choices: ["Radio waves", "Infrared", "X-rays", "Gamma rays"], correct: 3 },
  { question: "The theory of evolution by natural selection was proposed by?", choices: ["Alfred Russel Wallace", "Charles Darwin", "Gregor Mendel", "Thomas Huxley"], correct: 1 },
  { question: "Which blood type is known as the 'universal donor'?", choices: ["A negative", "B negative", "AB positive", "O negative"], correct: 3 },
  { question: "What is the main component of the Sun?", choices: ["Helium", "Hydrogen", "Oxygen", "Carbon"], correct: 1 },
  { question: "Sound travels fastest through?", choices: ["Air", "Water", "Wood", "Steel"], correct: 3 },
  { question: "Quantum mechanics was primarily developed in which century?", choices: ["18th", "19th", "20th", "21st"], correct: 2 },
  { question: "What organelle is responsible for energy production in cells?", choices: ["Nucleus", "Ribosome", "Golgi apparatus", "Mitochondria"], correct: 3 },
  { question: "Which element is a liquid at room temperature besides mercury?", choices: ["Bromine", "Cesium", "Gallium", "Francium"], correct: 0 },
  { question: "Newton's first law of motion describes?", choices: ["F = ma", "Gravity", "Inertia", "Momentum"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng);
  pool = pool.slice(0, Math.min(count, pool.length));
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
    case "select": {
      if (state.submitted) return state;
      return { ...state, selected: action.choice };
    }
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const speedBonus = isCorrect ? Math.floor(state.timeLeft * 10) : 0;
      const points = isCorrect ? 100 + speedBonus : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      return { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
