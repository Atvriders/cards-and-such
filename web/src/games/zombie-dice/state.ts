import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DieColor = "green" | "yellow" | "red";
export type DiceFace = "brain" | "running" | "shotgun";

export interface ZombieDie {
  color: DieColor;
  face: DiceFace;
}

export interface ZombieDiceSettings {
  targetBrains: "13" | "20" | "7";
}

export type ZombiePhase =
  | "preRoll"    // can roll or bank
  | "rolled"     // just rolled, can bank or continue
  | "busted"     // 3 shotguns — lose brains this turn
  | "won";       // banked enough brains

// Die pool: green x6, yellow x4, red x3
const POOL_COLORS: DieColor[] = [
  "green","green","green","green","green","green",
  "yellow","yellow","yellow","yellow",
  "red","red","red",
];

// Faces per color (cumulative probability represented as face arrays)
const GREEN_FACES: DiceFace[] = ["brain","brain","brain","running","running","shotgun"];
const YELLOW_FACES: DiceFace[] = ["brain","brain","running","running","shotgun","shotgun"];
const RED_FACES: DiceFace[] = ["brain","running","running","shotgun","shotgun","shotgun"];

export interface ZombieDiceState {
  settings: ZombieDiceSettings;
  rngSeed: number;
  bankedBrains: number;
  turnBrains: number;       // brains collected this turn (not yet banked)
  turnShotguns: number;     // shotguns this turn
  rolling: ZombieDie[];     // dice currently being rerolled (runners)
  pool: DieColor[];         // remaining dice in pool (shuffled each new draw)
  lastRoll: ZombieDie[];    // all 3 dice from last roll
  phase: ZombiePhase;
}

export type ZombieAction =
  | { type: "roll" }
  | { type: "bank" }
  | { type: "nextTurn" };

export function initialState(seed: number, settings: ZombieDiceSettings): ZombieDiceState {
  return {
    settings,
    rngSeed: seed,
    bankedBrains: 0,
    turnBrains: 0,
    turnShotguns: 0,
    rolling: [],
    pool: [...POOL_COLORS],
    lastRoll: [],
    phase: "preRoll",
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function rollFace(color: DieColor, rng: () => number): DiceFace {
  const faces = color === "green" ? GREEN_FACES : color === "yellow" ? YELLOW_FACES : RED_FACES;
  return faces[Math.floor(rng() * 6)]!;
}

function shuffleColors(colors: DieColor[], rng: () => number): DieColor[] {
  const arr = [...colors];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function reducer(state: ZombieDiceState, action: ZombieAction): ZombieDiceState {
  if (state.phase === "won") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolled") return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);

      // We need 3 dice to roll. Start with rolling (runners) and draw from pool.
      const needFromPool = 3 - state.rolling.length;
      let pool = state.pool;

      // If pool doesn't have enough, replenish from full pool minus already-committed dice
      if (pool.length < needFromPool) {
        pool = shuffleColors([...POOL_COLORS], rng);
      }

      // Shuffle pool to draw randomly
      const shuffled = shuffleColors(pool, rng);
      const drawn = shuffled.slice(0, needFromPool).map((color) => color);
      const newPool = shuffled.slice(needFromPool);

      // All 3 dice to roll: runners + drawn
      const allColors: DieColor[] = [
        ...state.rolling.map((d) => d.color),
        ...drawn,
      ];

      const roll: ZombieDie[] = allColors.map((color) => ({
        color,
        face: rollFace(color, rng),
      }));

      const newBrains = state.turnBrains + roll.filter((d) => d.face === "brain").length;
      const newShotguns = state.turnShotguns + roll.filter((d) => d.face === "shotgun").length;
      const runners = roll.filter((d) => d.face === "running");

      const busted = newShotguns >= 3;

      if (busted) {
        return {
          ...state,
          rngSeed: nextSeed,
          turnBrains: newBrains,
          turnShotguns: newShotguns,
          rolling: runners,
          pool: newPool,
          lastRoll: roll,
          phase: "busted",
        };
      }

      const target = parseInt(state.settings.targetBrains, 10);
      const newBanked = state.bankedBrains; // not yet banked
      const couldWin = newBanked + newBrains >= target;

      return {
        ...state,
        rngSeed: nextSeed,
        turnBrains: newBrains,
        turnShotguns: newShotguns,
        rolling: runners,
        pool: newPool,
        lastRoll: roll,
        phase: couldWin ? "rolled" : "rolled",
      };
    }

    case "bank": {
      if (state.phase !== "rolled") return state;

      const target = parseInt(state.settings.targetBrains, 10);
      const newBanked = state.bankedBrains + state.turnBrains;
      const won = newBanked >= target;

      return {
        ...state,
        bankedBrains: newBanked,
        turnBrains: 0,
        turnShotguns: 0,
        rolling: [],
        pool: [...POOL_COLORS],
        lastRoll: [],
        phase: won ? "won" : "preRoll",
      };
    }

    case "nextTurn": {
      if (state.phase !== "busted") return state;
      // Lose turn brains — reset without banking
      return {
        ...state,
        turnBrains: 0,
        turnShotguns: 0,
        rolling: [],
        pool: [...POOL_COLORS],
        lastRoll: [],
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ZombieDiceState): { score: number } | null {
  if (state.phase !== "won") return null;
  return { score: state.bankedBrains };
}
