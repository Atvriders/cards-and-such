import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface UnitConverterSettings {
  rounds: "15" | "20" | "30";
  category: "all" | "length" | "weight" | "temperature";
}

export interface UnitQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  category: string;
}

export interface UnitConverterState {
  settings: UnitConverterSettings;
  questions: UnitQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type UnitConverterAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

type UnitEntry = {
  question: string;
  answer: string;
  wrongs: string[];
  category: string;
};

const UNIT_POOL: UnitEntry[] = [
  // Length
  { question: "1 meter = ? feet", answer: "3.28 ft", wrongs: ["2.54 ft", "4.00 ft", "1.09 ft"], category: "length" },
  { question: "1 foot = ? centimeters", answer: "30.48 cm", wrongs: ["25.40 cm", "12.00 cm", "36.00 cm"], category: "length" },
  { question: "1 mile = ? kilometers", answer: "1.609 km", wrongs: ["1.000 km", "2.000 km", "1.250 km"], category: "length" },
  { question: "1 kilometer = ? miles", answer: "0.621 mi", wrongs: ["0.500 mi", "1.000 mi", "0.750 mi"], category: "length" },
  { question: "1 inch = ? centimeters", answer: "2.54 cm", wrongs: ["3.00 cm", "2.00 cm", "1.54 cm"], category: "length" },
  { question: "1 yard = ? meters", answer: "0.914 m", wrongs: ["1.000 m", "0.500 m", "1.200 m"], category: "length" },
  { question: "100 meters = ? yards (approx)", answer: "109 yd", wrongs: ["100 yd", "91 yd", "120 yd"], category: "length" },
  { question: "5 miles = ? kilometers (approx)", answer: "8.05 km", wrongs: ["5.00 km", "6.50 km", "10.0 km"], category: "length" },
  { question: "10 feet = ? meters (approx)", answer: "3.05 m", wrongs: ["3.28 m", "2.50 m", "4.00 m"], category: "length" },
  { question: "1 nautical mile = ? km", answer: "1.852 km", wrongs: ["1.609 km", "2.000 km", "1.200 km"], category: "length" },
  // Weight
  { question: "1 kilogram = ? pounds", answer: "2.205 lb", wrongs: ["1.000 lb", "2.000 lb", "3.000 lb"], category: "weight" },
  { question: "1 pound = ? grams", answer: "453.6 g", wrongs: ["500.0 g", "350.0 g", "1000.0 g"], category: "weight" },
  { question: "1 ounce = ? grams", answer: "28.35 g", wrongs: ["25.00 g", "30.00 g", "100.0 g"], category: "weight" },
  { question: "1 stone = ? kilograms", answer: "6.35 kg", wrongs: ["5.00 kg", "7.00 kg", "10.0 kg"], category: "weight" },
  { question: "1 metric ton = ? kilograms", answer: "1000 kg", wrongs: ["100 kg", "500 kg", "2000 kg"], category: "weight" },
  { question: "5 pounds = ? kilograms (approx)", answer: "2.27 kg", wrongs: ["2.00 kg", "3.00 kg", "5.00 kg"], category: "weight" },
  { question: "10 kg = ? pounds (approx)", answer: "22.05 lb", wrongs: ["10.00 lb", "15.00 lb", "20.00 lb"], category: "weight" },
  { question: "1 short ton = ? pounds", answer: "2000 lb", wrongs: ["1000 lb", "2200 lb", "2500 lb"], category: "weight" },
  // Temperature
  { question: "0°C = ?°F", answer: "32°F", wrongs: ["0°F", "100°F", "212°F"], category: "temperature" },
  { question: "100°C = ?°F", answer: "212°F", wrongs: ["100°F", "180°F", "32°F"], category: "temperature" },
  { question: "37°C (body temp) = ?°F", answer: "98.6°F", wrongs: ["95.0°F", "100°F", "102°F"], category: "temperature" },
  { question: "-40°C = ?°F", answer: "-40°F", wrongs: ["-32°F", "-100°F", "0°F"], category: "temperature" },
  { question: "20°C = ?°F", answer: "68°F", wrongs: ["64°F", "72°F", "20°F"], category: "temperature" },
  { question: "72°F = ?°C (approx)", answer: "22.2°C", wrongs: ["20.0°C", "25.0°C", "30.0°C"], category: "temperature" },
  { question: "32°F = ?°C", answer: "0°C", wrongs: ["10°C", "-10°C", "32°C"], category: "temperature" },
  { question: "212°F = ?°C", answer: "100°C", wrongs: ["212°C", "80°C", "120°C"], category: "temperature" },
  { question: "98.6°F = ?°C", answer: "37°C", wrongs: ["36°C", "38°C", "40°C"], category: "temperature" },
  { question: "0 Kelvin = ?°C", answer: "-273.15°C", wrongs: ["0°C", "-100°C", "-273°F"], category: "temperature" },
  { question: "300 Kelvin = ?°C (approx)", answer: "26.85°C", wrongs: ["300°C", "27.15°C", "30.00°C"], category: "temperature" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: UnitConverterSettings): UnitConverterState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  let pool = settings.category === "all"
    ? UNIT_POOL
    : UNIT_POOL.filter(u => u.category === settings.category);
  pool = shuffle(pool, rng);

  const questions: UnitQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const entry = pool[i % pool.length]!;
    const allChoices = [entry.answer, ...entry.wrongs.slice(0, 3)];
    const shuffled = shuffle(allChoices, rng);
    questions.push({
      question: entry.question,
      choices: shuffled,
      correctIndex: shuffled.indexOf(entry.answer),
      category: entry.category,
    });
  }

  return {
    settings,
    questions,
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: UnitConverterState, action: UnitConverterAction): UnitConverterState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "select":
      if (state.submitted) return state;
      return { ...state, selected: action.index };

    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const correct = state.selected === q.correctIndex;
      return {
        ...state,
        submitted: true,
        score: correct ? state.score + 10 : state.score,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
      };
    }

    case "next": {
      if (!state.submitted) return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false };
    }

    default:
      return state;
  }
}

export function isTerminal(state: UnitConverterState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
