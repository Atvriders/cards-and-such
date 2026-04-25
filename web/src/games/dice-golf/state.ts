import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Golf: 9 or 18 hole golf simulation with dice.
// Each hole has a par (3, 4, or 5). Roll 2 dice to simulate shots.
// Low total = fewer strokes = better score (golf scoring).
// Roll outcome:
//   2 dice roll each turn. Sum determines stroke result:
//   2 = Hole in one (done in 1 shot, regardless of hole)
//   3-4 = Power Shot (advance 2 spots toward hole)
//   5-8 = Normal Shot (advance 1 spot)
//   9-11 = Rough/Off course (advance 1 spot but +1 penalty)
//   12 = Perfect Drive (advance 3 spots, no penalty)
// Hole needs "par" advances to sink; par-3 needs 3, par-4 needs 4, par-5 needs 5.

export interface DiceGolfSettings {
  holes: "9" | "18";
}

export type ShotResult = "holeInOne" | "powerShot" | "normalShot" | "rough" | "perfectDrive";

export interface DiceGolfHole {
  par: 3 | 4 | 5;
  strokes: number;
}

export interface DiceGolfState {
  settings: DiceGolfSettings;
  rngSeed: number;
  currentHole: number;      // 1-based
  currentStrokes: number;
  currentProgress: number;  // how many advances made this hole
  holes: DiceGolfHole[];    // completed holes
  lastRoll: [number, number] | null;
  lastResult: ShotResult | null;
  gameOver: boolean;
}

export type DiceGolfAction = { type: "roll" };

const HOLE_PARS: (3 | 4 | 5)[] = [
  4, 3, 5, 4, 4, 3, 5, 4, 4,
  5, 4, 3, 4, 5, 3, 4, 4, 5,
];

export function getHolePar(holeIndex: number): 3 | 4 | 5 {
  return HOLE_PARS[holeIndex % 18]!;
}

export function initialState(seed: number, settings: DiceGolfSettings): DiceGolfState {
  return {
    settings,
    rngSeed: seed,
    currentHole: 1,
    currentStrokes: 0,
    currentProgress: 0,
    holes: [],
    lastRoll: null,
    lastResult: null,
    gameOver: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function rollTwo(rng: () => number): [number, number] {
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return [d1, d2];
}

function sumToResult(sum: number): ShotResult {
  if (sum === 2) return "holeInOne";
  if (sum <= 4) return "powerShot";
  if (sum <= 8) return "normalShot";
  if (sum <= 11) return "rough";
  return "perfectDrive";
}

function resultAdvance(result: ShotResult): { advance: number; penalty: number } {
  switch (result) {
    case "holeInOne":   return { advance: 99, penalty: 0 }; // finishes hole
    case "powerShot":   return { advance: 2, penalty: 0 };
    case "normalShot":  return { advance: 1, penalty: 0 };
    case "rough":       return { advance: 1, penalty: 1 };
    case "perfectDrive":return { advance: 3, penalty: 0 };
  }
}

export function reducer(state: DiceGolfState, action: DiceGolfAction): DiceGolfState {
  if (state.gameOver) return state;
  if (action.type !== "roll") return state;

  const totalHoles = parseInt(state.settings.holes, 10);
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const roll = rollTwo(rng);
  const sum = roll[0] + roll[1];
  const result = sumToResult(sum);
  const { advance, penalty } = resultAdvance(result);

  const holePar = getHolePar(state.currentHole - 1);
  const newProgress = Math.min(state.currentProgress + advance, holePar);
  const newStrokes = state.currentStrokes + 1 + penalty;

  // Hole completed?
  if (newProgress >= holePar || result === "holeInOne") {
    const finalStrokes = result === "holeInOne" ? 1 : newStrokes;
    const completedHole: DiceGolfHole = { par: holePar, strokes: finalStrokes };
    const newHoles = [...state.holes, completedHole];
    const nextHole = state.currentHole + 1;
    const gameOver = nextHole > totalHoles;

    return {
      ...state,
      rngSeed: nextSeed,
      currentHole: nextHole,
      currentStrokes: 0,
      currentProgress: 0,
      holes: newHoles,
      lastRoll: roll,
      lastResult: result,
      gameOver,
    };
  }

  return {
    ...state,
    rngSeed: nextSeed,
    currentStrokes: newStrokes,
    currentProgress: newProgress,
    lastRoll: roll,
    lastResult: result,
  };
}

export function totalStrokes(holes: DiceGolfHole[]): number {
  return holes.reduce((s, h) => s + h.strokes, 0);
}

export function totalPar(holes: DiceGolfHole[]): number {
  return holes.reduce((s, h) => s + h.par, 0);
}

export function scoreVsPar(holes: DiceGolfHole[]): number {
  return totalStrokes(holes) - totalPar(holes);
}

export function isTerminal(state: DiceGolfState): { score: number } | null {
  if (!state.gameOver) return null;
  // Lower strokes vs par = better. Score: 500 - (strokes - par)*10, min 0
  const diff = scoreVsPar(state.holes);
  return { score: Math.max(0, 500 - diff * 10) };
}
