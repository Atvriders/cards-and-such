import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Viking Dice: press-your-luck game.
// Roll 6 dice. Axes (1,2) = raid points. Shields (5,6) protect. Skull (3,4) = danger.
// Collect 3 shields before 3 skulls to bank raid points. 3 skulls = bust.
// Target: reach 100 raid points.

export interface VikingDiceSettings {
  target: "50" | "100" | "150";
}

export type VikingFace = "axe" | "shield" | "skull";

function toFace(v: number): VikingFace {
  if (v <= 2) return "axe";
  if (v <= 4) return "skull";
  return "shield";
}

export interface VikingDie {
  value: number; // 1-6
  face: VikingFace;
  kept: boolean;
}

export type VikingPhase = "preRoll" | "rolled" | "busted";

export interface VikingDiceState {
  settings: VikingDiceSettings;
  rngSeed: number;
  totalRaid: number;
  turnsTaken: number;
  turnRaid: number;
  shields: number;
  skulls: number;
  phase: VikingPhase;
  lastRoll: VikingDie[];
  won: boolean;
}

export type VikingDiceAction =
  | { type: "roll" }
  | { type: "bank" }
  | { type: "nextTurn" };

export function initialState(seed: number, settings: VikingDiceSettings): VikingDiceState {
  return {
    settings,
    rngSeed: seed,
    totalRaid: 0,
    turnsTaken: 0,
    turnRaid: 0,
    shields: 0,
    skulls: 0,
    phase: "preRoll",
    lastRoll: [],
    won: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function rollN(n: number, rng: () => number): VikingDie[] {
  const result: VikingDie[] = [];
  for (let i = 0; i < n; i++) {
    const v = Math.floor(rng() * 6) + 1;
    result.push({ value: v, face: toFace(v), kept: false });
  }
  return result;
}

export function reducer(state: VikingDiceState, action: VikingDiceAction): VikingDiceState {
  if (state.won) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const roll = rollN(6, rng);
      const axes = roll.filter((d) => d.face === "axe").length;
      const shields = roll.filter((d) => d.face === "shield").length;
      const skulls = roll.filter((d) => d.face === "skull").length;

      const newShields = state.shields + shields;
      const newSkulls = state.skulls + skulls;
      // Each axe = 10 raid points this roll
      const newTurnRaid = state.turnRaid + axes * 10;

      // Shields cancel skulls: effective skulls reduced by accumulated shields
      const effectiveSkulls = Math.max(0, newSkulls - newShields);
      const busted = effectiveSkulls >= 3;

      return {
        ...state,
        rngSeed: nextSeed,
        lastRoll: roll,
        turnRaid: newTurnRaid,
        shields: newShields,
        skulls: newSkulls,
        phase: busted ? "busted" : "rolled",
      };
    }

    case "bank": {
      if (state.phase !== "rolled") return state;
      const newTotal = state.totalRaid + state.turnRaid;
      const target = parseInt(state.settings.target, 10);
      const won = newTotal >= target;
      return {
        ...state,
        totalRaid: newTotal,
        turnsTaken: state.turnsTaken + 1,
        turnRaid: 0,
        shields: 0,
        skulls: 0,
        phase: "preRoll",
        lastRoll: [],
        won,
      };
    }

    case "nextTurn": {
      if (state.phase !== "busted") return state;
      return {
        ...state,
        turnsTaken: state.turnsTaken + 1,
        turnRaid: 0,
        shields: 0,
        skulls: 0,
        phase: "preRoll",
        lastRoll: [],
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: VikingDiceState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 1000 - state.turnsTaken * 10) };
}
