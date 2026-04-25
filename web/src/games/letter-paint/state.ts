import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LetterPaintSettings {
  rounds: "5" | "10" | "15";
}

// 5x5 grid: each cell has a letter. Player must paint (select) all cells containing the target letter.
export interface LetterPaintState {
  settings: LetterPaintSettings;
  rngSeed: number;
  grid: string[];       // 25 characters, 5x5
  targetLetter: string;
  painted: boolean[];   // which cells have been painted
  totalRounds: number;
  currentRound: number;
  score: number;
  phase: "playing" | "result" | "done";
  roundScore: number;
  gameOver: boolean;
}

export type LetterPaintAction =
  | { type: "paint"; index: number }
  | { type: "submit" }
  | { type: "next-round" };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateRound(rng: () => number): { grid: string[]; target: string } {
  const target = LETTERS[Math.floor(rng() * 26)]!;
  const grid: string[] = [];
  for (let i = 0; i < 25; i++) {
    if (rng() < 0.25) {
      grid.push(target);
    } else {
      let c: string;
      do { c = LETTERS[Math.floor(rng() * 26)]!; } while (c === target);
      grid.push(c);
    }
  }
  // ensure at least 2 target cells
  let count = grid.filter(c => c === target).length;
  if (count < 2) {
    grid[Math.floor(rng() * 25)] = target;
    grid[Math.floor(rng() * 25)] = target;
  }
  return { grid, target };
}

export function initialState(seed: number, settings: LetterPaintSettings): LetterPaintState {
  const rng = mulberry32(seed);
  const total = parseInt(settings.rounds, 10);
  const { grid, target } = generateRound(rng);
  const newSeed = (seed + 0xdeadbeef) >>> 0;
  return {
    settings,
    rngSeed: newSeed,
    grid,
    targetLetter: target,
    painted: Array(25).fill(false),
    totalRounds: total,
    currentRound: 1,
    score: 0,
    phase: "playing",
    roundScore: 0,
    gameOver: false,
  };
}

export function reducer(state: LetterPaintState, action: LetterPaintAction): LetterPaintState {
  if (state.gameOver) return state;

  if (action.type === "paint" && state.phase === "playing") {
    const newPainted = [...state.painted];
    newPainted[action.index] = !newPainted[action.index];
    return { ...state, painted: newPainted };
  }

  if (action.type === "submit" && state.phase === "playing") {
    let correct = 0, wrong = 0;
    for (let i = 0; i < 25; i++) {
      const isTarget = state.grid[i] === state.targetLetter;
      const isPainted = state.painted[i];
      if (isTarget && isPainted) correct++;
      else if (!isTarget && isPainted) wrong++;
      else if (isTarget && !isPainted) wrong++;
    }
    const totalTargets = state.grid.filter(c => c === state.targetLetter).length;
    const roundScore = Math.max(0, correct * 10 - wrong * 5);
    const perfect = correct === totalTargets && wrong === 0;
    const bonus = perfect ? 20 : 0;
    return {
      ...state,
      phase: "result",
      roundScore: roundScore + bonus,
      score: state.score + roundScore + bonus,
    };
  }

  if (action.type === "next-round" && state.phase === "result") {
    const nextRound = state.currentRound + 1;
    if (nextRound > state.totalRounds) {
      return { ...state, phase: "done", gameOver: true };
    }
    const rng = mulberry32(state.rngSeed);
    const { grid, target } = generateRound(rng);
    const newSeed = (state.rngSeed + 0xdeadbeef) >>> 0;
    return {
      ...state,
      rngSeed: newSeed,
      grid,
      targetLetter: target,
      painted: Array(25).fill(false),
      currentRound: nextRound,
      phase: "playing",
      roundScore: 0,
    };
  }

  return state;
}

export function isTerminal(state: LetterPaintState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
