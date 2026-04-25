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
  { question: "Which planet is known as the Red Planet?", choices: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
  { question: "The first human to walk on the Moon was?", choices: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Alan Shepard"], correct: 2 },
  { question: "How many moons does Earth have?", choices: ["0", "1", "2", "3"], correct: 1 },
  { question: "Which is the largest planet in our solar system?", choices: ["Saturn", "Uranus", "Neptune", "Jupiter"], correct: 3 },
  { question: "A light-year is a measure of?", choices: ["Time", "Speed", "Distance", "Mass"], correct: 2 },
  { question: "The Milky Way is what type of galaxy?", choices: ["Elliptical", "Irregular", "Lenticular", "Spiral"], correct: 3 },
  { question: "Which space telescope was launched in 1990?", choices: ["Chandra", "Spitzer", "James Webb", "Hubble"], correct: 3 },
  { question: "The first artificial satellite launched into space was?", choices: ["Explorer 1", "Vostok 1", "Sputnik 1", "Vanguard 1"], correct: 2 },
  { question: "Saturn is known for its distinctive?", choices: ["Red spot", "Blue color", "Rings", "Many moons"], correct: 2 },
  { question: "A black hole's escape velocity exceeds?", choices: ["Sound speed", "Light speed", "Earth's gravity", "Rocket speed"], correct: 1 },
  { question: "Which planet has a day longer than its year?", choices: ["Mercury", "Mars", "Venus", "Neptune"], correct: 2 },
  { question: "The International Space Station orbits Earth at approximately what altitude?", choices: ["200 km", "400 km", "800 km", "1200 km"], correct: 1 },
  { question: "What is the closest star to our solar system?", choices: ["Sirius", "Betelgeuse", "Proxima Centauri", "Alpha Centauri A"], correct: 2 },
  { question: "NASA stands for?", choices: ["National Aeronautics and Space Administration", "National Aerospace and Science Agency", "North American Space Agency", "National Astrophysics and Space Agency"], correct: 0 },
  { question: "Which planet rotates on its side (axial tilt of ~98 degrees)?", choices: ["Neptune", "Saturn", "Uranus", "Jupiter"], correct: 2 },
  { question: "The Big Bang theory describes the origin of?", choices: ["Black holes", "Stars", "The universe", "Galaxies"], correct: 2 },
  { question: "A supernova is the explosion of a dying?", choices: ["Planet", "Moon", "Star", "Galaxy"], correct: 2 },
  { question: "Mars has how many moons?", choices: ["0", "1", "2", "4"], correct: 2 },
  { question: "Which planet is farthest from the Sun?", choices: ["Saturn", "Uranus", "Neptune", "Pluto"], correct: 2 },
  { question: "The asteroid belt lies between which two planets?", choices: ["Earth and Mars", "Mars and Jupiter", "Jupiter and Saturn", "Saturn and Uranus"], correct: 1 },
  { question: "The study of celestial objects and space is called?", choices: ["Cosmology", "Astrology", "Astrophysics", "Astronomy"], correct: 3 },
  { question: "The first human in space was?", choices: ["Neil Armstrong", "Alan Shepard", "Yuri Gagarin", "John Glenn"], correct: 2 },
  { question: "Which mission first landed humans on the Moon?", choices: ["Apollo 10", "Apollo 11", "Apollo 12", "Gemini 9"], correct: 1 },
  { question: "What causes the seasons on Earth?", choices: ["Distance from Sun", "Solar flares", "Earth's axial tilt", "Moon's gravity"], correct: 2 },
  { question: "How long does it take for light from the Sun to reach Earth?", choices: ["4 minutes", "8 minutes", "12 minutes", "15 minutes"], correct: 1 },
  { question: "The Great Red Spot on Jupiter is?", choices: ["A volcano", "A crater", "A persistent storm", "A mountain range"], correct: 2 },
  { question: "Dark matter makes up approximately what percentage of the universe?", choices: ["5%", "27%", "50%", "68%"], correct: 1 },
  { question: "Which dwarf planet was demoted from full planet status in 2006?", choices: ["Ceres", "Eris", "Pluto", "Makemake"], correct: 2 },
  { question: "The Cassini spacecraft studied which planet?", choices: ["Jupiter", "Uranus", "Neptune", "Saturn"], correct: 3 },
  { question: "Stars are primarily composed of?", choices: ["Oxygen and nitrogen", "Carbon and oxygen", "Hydrogen and helium", "Iron and nickel"], correct: 2 },
  { question: "The event horizon is associated with?", choices: ["Neutron stars", "Supernovae", "Black holes", "Quasars"], correct: 2 },
  { question: "Which planet has the most violent winds in the solar system?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 3 },
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
