import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CurlingSettings {
  ends: "4" | "8";
}

export interface Stone {
  weight: number;   // 0..1 throw weight
  line: number;     // 0..1 delivery line (0=left edge, 1=right edge, 0.5=center)
  sweep: number;    // 0..1 sweeping effort
  finalX: number;   // final horizontal position in house (0..1)
  finalY: number;   // final distance down sheet (0=short, 1=button)
  inHouse: boolean;
  score: number;    // rings: button=4, 8foot=3, 12foot=2, outside=0
}

export interface CurlingState {
  settings: CurlingSettings;
  rngSeed: number;
  totalEnds: number;
  endIndex: number;
  stonesPerEnd: number;
  stoneIndex: number;
  stones: Stone[];
  weight: number;
  line: number;
  sweep: number;
  phase: "aim" | "result" | "done";
  lastResult: string;
  totalScore: number;
  endScores: number[];
}

export type CurlingAction =
  | { type: "set-weight"; value: number }
  | { type: "set-line"; value: number }
  | { type: "set-sweep"; value: number }
  | { type: "throw" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function throwStone(weight: number, line: number, sweep: number, seed: number): Stone {
  const rng = mulberry32(seed);
  const noise = (rng() - 0.5) * 0.12;
  const weightNoise = (rng() - 0.5) * 0.1;

  // Ideal weight=0.65, line=0.5 puts stone in button
  const weightFactor = weight + weightNoise + sweep * 0.07;
  const lineDev = line - 0.5 + noise;

  const finalX = Math.max(0, Math.min(1, 0.5 + lineDev * 1.2));
  const finalY = Math.max(0, Math.min(1, weightFactor));

  const centerDist = Math.sqrt((finalX - 0.5) ** 2 + (finalY - 0.65) ** 2);
  const inHouse = centerDist < 0.4;
  let score = 0;
  if (inHouse) {
    if (centerDist < 0.05) score = 4;
    else if (centerDist < 0.13) score = 3;
    else if (centerDist < 0.25) score = 2;
    else score = 1;
  }

  return { weight, line, sweep, finalX, finalY, inHouse, score };
}

export function initialState(seed: number, settings: CurlingSettings): CurlingState {
  return {
    settings,
    rngSeed: seed >>> 0,
    totalEnds: parseInt(settings.ends, 10),
    endIndex: 0,
    stonesPerEnd: 4,
    stoneIndex: 0,
    stones: [],
    weight: 0.65,
    line: 0.5,
    sweep: 0.5,
    phase: "aim",
    lastResult: "",
    totalScore: 0,
    endScores: [],
  };
}

export function reducer(state: CurlingState, action: CurlingAction): CurlingState {
  if (state.phase === "done") return state;

  if (action.type === "set-weight" && state.phase === "aim") {
    return { ...state, weight: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-line" && state.phase === "aim") {
    return { ...state, line: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-sweep" && state.phase === "aim") {
    return { ...state, sweep: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "throw" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const stone = throwStone(state.weight, state.line, state.sweep, seed1);
    const newStones = [...state.stones, stone];
    const newStoneIndex = state.stoneIndex + 1;
    const endDone = newStoneIndex >= state.stonesPerEnd;
    let newEndIndex = state.endIndex;
    let newTotalScore = state.totalScore + stone.score;
    const newEndScores = [...state.endScores];
    if (endDone) {
      const endScore = newStones.slice(-state.stonesPerEnd).reduce((a, s) => a + s.score, 0);
      newEndScores.push(endScore - (newEndScores.reduce((a, b) => a + b, 0) + state.endScores.reduce((a, b) => a + b, 0)));
      newEndIndex = state.endIndex + 1;
    }
    const done = endDone && newEndIndex >= state.totalEnds;
    const ringNames = ["", "Outer", "12-foot", "8-foot", "Button!"];
    const msg = stone.inHouse ? `${ringNames[stone.score] ?? ""}  (${stone.score} pts)` : "Out of house";

    return {
      ...state,
      rngSeed: seed2,
      stones: newStones,
      stoneIndex: endDone ? 0 : newStoneIndex,
      endIndex: newEndIndex,
      endScores: newEndScores,
      totalScore: newTotalScore,
      lastResult: msg,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: CurlingState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.totalScore * 25 };
}
