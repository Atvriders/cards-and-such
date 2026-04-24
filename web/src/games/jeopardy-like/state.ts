import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface JeopardySettings {
  finalRound: boolean;
}

export interface JeopardyClue {
  question: string; // the "answer" shown to player
  answer: string;   // the "question" they must provide
  value: number;
}

export interface JeopardyCategory {
  title: string;
  clues: JeopardyClue[]; // 5 clues at values 200,400,600,800,1000
}

export type JeopardyPhase = "board" | "reading" | "answering" | "reveal" | "final_wager" | "final_answer" | "final_reveal" | "done";

export interface JeopardyState {
  settings: JeopardySettings;
  categories: JeopardyCategory[];
  picked: boolean[][]; // [cat][clue] picked
  score: number;
  phase: JeopardyPhase;
  activeCat: number;
  activeClue: number;
  userAnswer: string;
  lastCorrect: boolean | null;
  finalWager: string;
  finalUserAnswer: string;
  finalCorrect: boolean | null;
  finalClue: JeopardyClue;
  seed: number;
}

export type JeopardyAction =
  | { type: "pick_clue"; cat: number; clue: number }
  | { type: "set_answer"; value: string }
  | { type: "submit_answer" }
  | { type: "continue" }
  | { type: "set_wager"; value: string }
  | { type: "submit_wager" }
  | { type: "set_final_answer"; value: string }
  | { type: "submit_final" };

const VALUES = [200, 400, 600, 800, 1000];

const RAW_CATEGORIES: { title: string; clues: { q: string; a: string }[] }[] = [
  {
    title: "World Capitals",
    clues: [
      { q: "Capital of France", a: "Paris" },
      { q: "Capital of Japan", a: "Tokyo" },
      { q: "Capital of Brazil", a: "Brasilia" },
      { q: "Capital of Australia", a: "Canberra" },
      { q: "Capital of Egypt", a: "Cairo" },
    ],
  },
  {
    title: "Science Basics",
    clues: [
      { q: "Chemical symbol for water", a: "H2O" },
      { q: "Planet closest to the Sun", a: "Mercury" },
      { q: "Force that keeps us on Earth", a: "Gravity" },
      { q: "Number of chromosomes in human cells", a: "46" },
      { q: "Particle with negative charge", a: "Electron" },
    ],
  },
  {
    title: "History Moments",
    clues: [
      { q: "Year the Berlin Wall fell", a: "1989" },
      { q: "First country to give women the right to vote", a: "New Zealand" },
      { q: "Empire ruled by Julius Caesar", a: "Roman" },
      { q: "Year Columbus reached the Americas", a: "1492" },
      { q: "City destroyed by Vesuvius in 79 AD", a: "Pompeii" },
    ],
  },
  {
    title: "Geography",
    clues: [
      { q: "Longest river in Africa", a: "Nile" },
      { q: "Country with most natural lakes", a: "Canada" },
      { q: "Continent where Madagascar is found", a: "Africa" },
      { q: "Mountain range containing Everest", a: "Himalayas" },
      { q: "Ocean between the Americas and Europe/Africa", a: "Atlantic" },
    ],
  },
  {
    title: "Math & Numbers",
    clues: [
      { q: "Square root of 144", a: "12" },
      { q: "Value of pi (to 2 decimal places)", a: "3.14" },
      { q: "Number of sides on a hexagon", a: "6" },
      { q: "Prime number after 13", a: "17" },
      { q: "Percentage equal to 3/4", a: "75" },
    ],
  },
  {
    title: "Nature & Animals",
    clues: [
      { q: "Fastest land animal", a: "Cheetah" },
      { q: "Largest mammal on Earth", a: "Blue whale" },
      { q: "Process by which plants make food", a: "Photosynthesis" },
      { q: "Animal known to have 8 arms", a: "Octopus" },
      { q: "Gas plants absorb from the air", a: "Carbon dioxide" },
    ],
  },
];

const FINAL_CLUES: JeopardyClue[] = [
  { question: "This country is home to both the Amazon River and the Sugarloaf Mountain", answer: "Brazil", value: 0 },
  { question: "This Greek scientist first calculated the circumference of the Earth", answer: "Eratosthenes", value: 0 },
  { question: "This element is the most abundant in the Earth's atmosphere", answer: "Nitrogen", value: 0 },
  { question: "This ancient wonder stood in Alexandria, Egypt", answer: "Lighthouse of Alexandria", value: 0 },
  { question: "This organ produces bile to help digest fats", answer: "Liver", value: 0 },
];

export function initialState(seed: number, settings: JeopardySettings): JeopardyState {
  const rng = mulberry32(seed);
  const categories: JeopardyCategory[] = RAW_CATEGORIES.map(rc => ({
    title: rc.title,
    clues: rc.clues.map((cl, i) => ({ question: cl.q, answer: cl.a, value: VALUES[i]! })),
  }));
  // shuffle clues within each category for variety
  categories.forEach(cat => {
    for (let i = cat.clues.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [cat.clues[i], cat.clues[j]] = [cat.clues[j]!, cat.clues[i]!];
    }
    cat.clues.forEach((cl, i) => { cl.value = VALUES[i]!; });
  });
  const finalIdx = Math.floor(rng() * FINAL_CLUES.length);
  const finalClue = FINAL_CLUES[finalIdx]!;

  return {
    settings,
    categories,
    picked: categories.map(() => [false, false, false, false, false]),
    score: 0,
    phase: "board",
    activeCat: 0,
    activeClue: 0,
    userAnswer: "",
    lastCorrect: null,
    finalWager: "",
    finalUserAnswer: "",
    finalCorrect: null,
    finalClue,
    seed,
  };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function checkAnswer(user: string, correct: string): boolean {
  const u = normalize(user);
  const c = normalize(correct);
  if (u === c) return true;
  if (c.includes(u) && u.length >= 3) return true;
  if (u.includes(c) && c.length >= 3) return true;
  return false;
}

function boardComplete(picked: boolean[][]): boolean {
  return picked.every(row => row.every(v => v));
}

export function reducer(state: JeopardyState, action: JeopardyAction): JeopardyState {
  switch (action.type) {
    case "pick_clue": {
      if (state.phase !== "board") return state;
      if (state.picked[action.cat]?.[action.clue]) return state;
      return {
        ...state,
        phase: "reading",
        activeCat: action.cat,
        activeClue: action.clue,
        userAnswer: "",
        lastCorrect: null,
      };
    }

    case "set_answer":
      if (state.phase !== "answering") return state;
      return { ...state, userAnswer: action.value };

    case "submit_answer": {
      if (state.phase !== "answering") return state;
      const clue = state.categories[state.activeCat]!.clues[state.activeClue]!;
      const correct = checkAnswer(state.userAnswer, clue.answer);
      const delta = correct ? clue.value : -clue.value;
      const newPicked = state.picked.map((row, ci) =>
        ci === state.activeCat ? row.map((v, ri) => ri === state.activeClue ? true : v) : row
      );
      return {
        ...state,
        score: state.score + delta,
        picked: newPicked,
        lastCorrect: correct,
        phase: "reveal",
      };
    }

    case "continue": {
      if (state.phase === "reading") {
        return { ...state, phase: "answering" };
      }
      if (state.phase === "reveal") {
        if (boardComplete(state.picked)) {
          if (state.settings.finalRound) {
            return { ...state, phase: "final_wager" };
          }
          return { ...state, phase: "done" };
        }
        return { ...state, phase: "board" };
      }
      if (state.phase === "final_reveal") {
        return { ...state, phase: "done" };
      }
      return state;
    }

    case "set_wager":
      if (state.phase !== "final_wager") return state;
      return { ...state, finalWager: action.value };

    case "submit_wager": {
      if (state.phase !== "final_wager") return state;
      const w = parseInt(state.finalWager);
      if (isNaN(w) || w < 0) return state;
      return { ...state, phase: "final_answer" };
    }

    case "set_final_answer":
      if (state.phase !== "final_answer") return state;
      return { ...state, finalUserAnswer: action.value };

    case "submit_final": {
      if (state.phase !== "final_answer") return state;
      const wager = Math.min(Math.max(parseInt(state.finalWager) || 0, 0), Math.max(state.score, 1000));
      const correct = checkAnswer(state.finalUserAnswer, state.finalClue.answer);
      const delta = correct ? wager : -wager;
      return {
        ...state,
        score: state.score + delta,
        finalCorrect: correct,
        phase: "final_reveal",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: JeopardyState): { score: number } | null {
  if (state.phase === "done") return { score: Math.max(0, state.score) };
  return null;
}
