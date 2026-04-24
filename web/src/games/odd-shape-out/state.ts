import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type OSOPhase = "idle" | "playing" | "result" | "done";
export type Difficulty = "easy" | "medium" | "hard";

const TIME_LIMIT_MS: Record<Difficulty, number> = {
  easy: 8000,
  medium: 5000,
  hard: 3000,
};

const TOTAL_ROUNDS = 20;
const GRID_SIZE = 8;

// Shape groups: each group contains visually similar shapes
const SHAPE_GROUPS = [
  ["🔴","🟠","🟡","🟢","🔵","🟣"],  // circles
  ["🟥","🟧","🟨","🟩","🟦","🟪"],  // squares
  ["🔺","🔻"],                        // triangles
  ["⭐","🌟","💫","✨"],              // stars
  ["💎","🔷","🔹","💠"],             // diamonds
  ["🐶","🐱","🐭","🐰","🦊","🐻"],  // animals
  ["🍎","🍊","🍋","🍇","🍓","🍉"],  // fruits
  ["🌸","🌺","🌻","🌹","🌷","🌼"],  // flowers
] as const;

export interface OSOState {
  settings: { difficulty: Difficulty };
  phase: OSOPhase;
  /** 8 shapes shown — one is the odd one out */
  shapes: readonly string[];
  /** Index of the odd shape */
  oddIndex: number;
  round: number;
  score: number;
  correct: number;
  timeLimit: number;
  /** ms remaining — decremented externally via tick */
  timeLeft: number;
  lastResult: "correct" | "wrong" | "timeout" | null;
  rngSeed: number;
  rngCounter: number;
}

export type OSOAction =
  | { type: "start" }
  | { type: "pick"; index: number }
  | { type: "tick"; elapsed: number }
  | { type: "next" };

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function buildRound(seed: number, counter: number): { shapes: string[]; oddIndex: number } {
  const rng = mulberry32(seed + counter * 999983);

  // Pick a majority group
  const groupIdx = Math.floor(rng() * SHAPE_GROUPS.length);
  const group = [...SHAPE_GROUPS[groupIdx]!];

  // Pick a different group for the odd one
  let oddGroupIdx = Math.floor(rng() * (SHAPE_GROUPS.length - 1));
  if (oddGroupIdx >= groupIdx) oddGroupIdx++;
  const oddGroup = [...SHAPE_GROUPS[oddGroupIdx]!];

  // Pick 7 shapes from majority group (may repeat if group is small)
  const majority: string[] = [];
  for (let i = 0; i < GRID_SIZE - 1; i++) {
    majority.push(group[Math.floor(rng() * group.length)]!);
  }

  // Pick 1 shape from odd group
  const oddShape = oddGroup[Math.floor(rng() * oddGroup.length)]!;

  // Place the odd shape at a random position
  const oddPos = Math.floor(rng() * GRID_SIZE);
  const all: string[] = [...majority.slice(0, oddPos), oddShape, ...majority.slice(oddPos)];

  return { shapes: all.slice(0, GRID_SIZE), oddIndex: oddPos };
}

export function initialState(
  seed: number,
  settings: { difficulty: Difficulty },
): OSOState {
  return {
    settings,
    phase: "idle",
    shapes: [],
    oddIndex: -1,
    round: 0,
    score: 0,
    correct: 0,
    timeLimit: TIME_LIMIT_MS[settings.difficulty],
    timeLeft: TIME_LIMIT_MS[settings.difficulty],
    lastResult: null,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: OSOState, action: OSOAction): OSOState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const { shapes, oddIndex } = buildRound(state.rngSeed, state.rngCounter);
      const timeLimit = TIME_LIMIT_MS[state.settings.difficulty];
      return {
        ...state,
        phase: "playing",
        shapes,
        oddIndex,
        round: 1,
        score: 0,
        correct: 0,
        timeLimit,
        timeLeft: timeLimit,
        lastResult: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "pick": {
      if (state.phase !== "playing") return state;
      const correct = action.index === state.oddIndex;
      const timeBonus = Math.floor(state.timeLeft / 100);
      return {
        ...state,
        phase: "result",
        lastResult: correct ? "correct" : "wrong",
        score: state.score + (correct ? 10 + timeBonus : 0),
        correct: state.correct + (correct ? 1 : 0),
      };
    }

    case "tick": {
      if (state.phase !== "playing") return state;
      const newTime = state.timeLeft - action.elapsed;
      if (newTime <= 0) {
        return {
          ...state,
          phase: "result",
          timeLeft: 0,
          lastResult: "timeout",
        };
      }
      return { ...state, timeLeft: newTime };
    }

    case "next": {
      if (state.phase !== "result") return state;
      if (state.round >= TOTAL_ROUNDS) {
        return { ...state, phase: "done" };
      }
      const { shapes, oddIndex } = buildRound(state.rngSeed, state.rngCounter);
      const timeLimit = TIME_LIMIT_MS[state.settings.difficulty];
      return {
        ...state,
        phase: "playing",
        shapes,
        oddIndex,
        round: state.round + 1,
        timeLimit,
        timeLeft: timeLimit,
        lastResult: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: OSOState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
