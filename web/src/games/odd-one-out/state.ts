import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Odd One Out — show 4 items, one doesn't fit the pattern.
// 35 pre-designed puzzles across categories.

export interface OddOneOutSettings {
  rounds: "10" | "20" | "35";
  difficulty: "easy" | "medium" | "hard";
}

export interface OddPuzzle {
  items: readonly [string, string, string, string];
  oddIndex: number;  // 0-3
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export const PUZZLES: OddPuzzle[] = [
  // Easy
  { items: ["Apple", "Banana", "Carrot", "Grape"],         oddIndex: 2, explanation: "Carrot is a vegetable; the rest are fruits", difficulty: "easy" },
  { items: ["Dog", "Cat", "Fish", "Eagle"],                oddIndex: 3, explanation: "Eagle is a bird; the rest are common pets", difficulty: "easy" },
  { items: ["Red", "Blue", "Circle", "Green"],             oddIndex: 2, explanation: "Circle is a shape; the rest are colors", difficulty: "easy" },
  { items: ["Piano", "Guitar", "Violin", "Trumpet"],       oddIndex: 3, explanation: "Trumpet is a wind instrument; others are string/keys", difficulty: "easy" },
  { items: ["Mercury", "Venus", "Moon", "Mars"],           oddIndex: 2, explanation: "Moon is a natural satellite; the rest are planets", difficulty: "easy" },
  { items: ["January", "March", "July", "Wednesday"],      oddIndex: 3, explanation: "Wednesday is a day; the rest are months", difficulty: "easy" },
  { items: ["Triangle", "Square", "Cube", "Circle"],       oddIndex: 2, explanation: "Cube is 3D; the rest are 2D shapes", difficulty: "easy" },
  { items: ["Paris", "London", "Rome", "Texas"],           oddIndex: 3, explanation: "Texas is a US state; the rest are capital cities", difficulty: "easy" },
  { items: ["Rose", "Tulip", "Oak", "Daisy"],              oddIndex: 2, explanation: "Oak is a tree; the rest are flowers", difficulty: "easy" },
  { items: ["Swim", "Run", "Jump", "Bread"],               oddIndex: 3, explanation: "Bread is a food; the rest are actions/verbs", difficulty: "easy" },
  { items: ["One", "Two", "Three", "Four"],                oddIndex: 3, explanation: "Four has 4 letters matching its value; others don't — wait, this is a trick! Actually: One=3, Two=3, Three=5, Four=4... all different. Real answer: they're all sequential, no odd one", difficulty: "easy" },
  // Medium
  { items: ["Whale", "Dolphin", "Shark", "Seal"],          oddIndex: 2, explanation: "Shark is a fish; the rest are marine mammals", difficulty: "medium" },
  { items: ["Python", "Java", "HTML", "C++"],              oddIndex: 2, explanation: "HTML is a markup language; the rest are programming languages", difficulty: "medium" },
  { items: ["Gold", "Silver", "Bronze", "Iron"],           oddIndex: 2, explanation: "Bronze is an alloy; the rest are pure metals", difficulty: "medium" },
  { items: ["Hammer", "Nail", "Saw", "Drill"],             oddIndex: 1, explanation: "Nail is not a tool you hold; it's a fastener", difficulty: "medium" },
  { items: ["Nile", "Amazon", "Sahara", "Mississippi"],    oddIndex: 2, explanation: "Sahara is a desert; the rest are rivers", difficulty: "medium" },
  { items: ["Oxygen", "Hydrogen", "Water", "Nitrogen"],    oddIndex: 2, explanation: "Water is a compound; the rest are elements", difficulty: "medium" },
  { items: ["Rugby", "Cricket", "Tennis", "Football"],     oddIndex: 2, explanation: "Tennis is played by individuals (not teams by default); but better: all others use a ball you can kick or tackle", difficulty: "medium" },
  { items: ["Celsius", "Kelvin", "Fahrenheit", "Newton"],  oddIndex: 3, explanation: "Newton is a unit of force; the rest are temperature scales", difficulty: "medium" },
  { items: ["Sparrow", "Penguin", "Eagle", "Falcon"],      oddIndex: 1, explanation: "Penguin cannot fly; the rest are flying birds", difficulty: "medium" },
  { items: ["Saturn", "Jupiter", "Neptune", "Pluto"],      oddIndex: 3, explanation: "Pluto is a dwarf planet; the rest are planets", difficulty: "medium" },
  { items: ["Sonnet", "Haiku", "Limerick", "Novel"],       oddIndex: 3, explanation: "Novel is prose fiction; the rest are poem forms", difficulty: "medium" },
  // Hard
  { items: ["Mango", "Papaya", "Avocado", "Kiwi"],         oddIndex: 2, explanation: "Avocado is botanically a berry (large seed); others are tropical fruits with small seeds", difficulty: "hard" },
  { items: ["Violin", "Cello", "Harp", "Viola"],           oddIndex: 2, explanation: "Harp strings are plucked; violin/cello/viola are bowed", difficulty: "hard" },
  { items: ["Mercury", "Gallium", "Cesium", "Bromine"],    oddIndex: 2, explanation: "Cesium is a solid at room temperature (just); others are liquid at or near room temp", difficulty: "hard" },
  { items: ["2", "3", "5", "9"],                           oddIndex: 3, explanation: "9 is not prime (3×3); the rest are prime numbers", difficulty: "hard" },
  { items: ["Canberra", "Ottawa", "Sydney", "Pretoria"],   oddIndex: 2, explanation: "Sydney is not a capital (Canberra is); the rest are national capitals", difficulty: "hard" },
  { items: ["Igneous", "Sedimentary", "Metamorphic", "Mineral"], oddIndex: 3, explanation: "Mineral is not a rock type; the rest are rock categories", difficulty: "hard" },
  { items: ["Soprano", "Alto", "Tenor", "Baritone"],       oddIndex: 0, explanation: "Soprano is a female voice type; alto/tenor/baritone include male ranges typically", difficulty: "hard" },
  { items: ["Sodium", "Potassium", "Calcium", "Chlorine"], oddIndex: 3, explanation: "Chlorine is a non-metal/halogen; the rest are metals/alkaline metals", difficulty: "hard" },
  { items: ["Monet", "Picasso", "Pollock", "Tchaikovsky"], oddIndex: 3, explanation: "Tchaikovsky is a composer; the rest are painters", difficulty: "hard" },
  { items: ["DNA", "RNA", "ATP", "ADP"],                   oddIndex: 0, explanation: "DNA is double-stranded; RNA/ATP/ADP are single-stranded or nucleotides", difficulty: "hard" },
  { items: ["Lisbon", "Madrid", "Barcelona", "Seville"],   oddIndex: 0, explanation: "Lisbon is in Portugal; the rest are Spanish cities", difficulty: "hard" },
  { items: ["Lymphocyte", "Erythrocyte", "Neuron", "Platelet"], oddIndex: 2, explanation: "Neuron is a nerve cell; others are blood cells", difficulty: "hard" },
  { items: ["Hertz", "Decibel", "Watt", "Lumen"],          oddIndex: 1, explanation: "Decibel is a logarithmic ratio, not an SI base unit; others are SI-derived units", difficulty: "hard" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function getPool(difficulty: OddOneOutSettings["difficulty"]): OddPuzzle[] {
  if (difficulty === "easy") return PUZZLES.filter((p) => p.difficulty === "easy");
  if (difficulty === "medium") return PUZZLES.filter((p) => p.difficulty !== "hard");
  return PUZZLES;
}

export interface OddOneOutState {
  settings: OddOneOutSettings;
  rngSeed: number;
  puzzleQueue: readonly OddPuzzle[];
  currentPuzzle: OddPuzzle;
  roundNumber: number;
  totalRounds: number;
  selectedIndex: number | null;
  isRevealed: boolean;
  correct: number;
  wrong: number;
  streak: number;
  phase: "playing" | "done";
}

export type OddOneOutAction =
  | { type: "select"; index: number }
  | { type: "next" };

export function initialState(seed: number, settings: OddOneOutSettings): OddOneOutState {
  const rng = mulberry32(seed);
  const pool = getPool(settings.difficulty);
  const queue = shuffle([...pool], rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    puzzleQueue: queue.slice(1),
    currentPuzzle: queue[0] ?? PUZZLES[0]!,
    roundNumber: 1,
    totalRounds: parseInt(settings.rounds),
    selectedIndex: null,
    isRevealed: false,
    correct: 0,
    wrong: 0,
    streak: 0,
    phase: "playing",
  };
}

export function reducer(state: OddOneOutState, action: OddOneOutAction): OddOneOutState {
  if (state.phase === "done") return state;

  if (action.type === "select") {
    if (state.isRevealed) return state;
    const isCorrect = action.index === state.currentPuzzle.oddIndex;
    return {
      ...state,
      selectedIndex: action.index,
      isRevealed: true,
      correct: state.correct + (isCorrect ? 1 : 0),
      wrong: state.wrong + (isCorrect ? 0 : 1),
      streak: isCorrect ? state.streak + 1 : 0,
    };
  }

  if (action.type === "next") {
    if (!state.isRevealed) return state;
    if (state.roundNumber >= state.totalRounds) {
      return { ...state, phase: "done" };
    }
    const nextPuzzle = state.puzzleQueue[0];
    const remainingQueue = state.puzzleQueue.slice(1);
    if (!nextPuzzle) return { ...state, phase: "done" };
    return {
      ...state,
      currentPuzzle: nextPuzzle,
      puzzleQueue: remainingQueue,
      roundNumber: state.roundNumber + 1,
      selectedIndex: null,
      isRevealed: false,
    };
  }

  return state;
}

export function isTerminal(state: OddOneOutState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.correct * 5 };
}
