import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pirate Dice: a treasure-hunt themed push-your-luck game.
// Roll 5 dice. Skulls (1) are danger — 3+ skulls and you're sunk.
// Gold coins (6) score. Diamonds (5) score less.
// Sabers (2) double your gold this turn if you have 3+.
// Other results (3, 4) are treasure maps — re-roll them freely.

export interface PirateDiceSettings {
  target: "5" | "10" | "15";
}

export type PdPhase = "preRoll" | "rolled" | "sunk" | "won";

export interface PirateDiceState {
  settings: PirateDiceSettings;
  rngSeed: number;
  treasure: number; // total score accumulated
  turnTreasure: number; // score this turn
  skulls: number; // skulls accumulated this turn (don't go away)
  keptMask: boolean[]; // true = locked (skull or gold kept)
  lastRoll: number[];
  turnsPlayed: number;
  phase: PdPhase;
}

export type PirateDiceAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "bank" }
  | { type: "nextTurn" };

function countFace(dice: number[], face: number): number {
  return dice.filter((d) => d === face).length;
}

export function calcTurnScore(dice: number[], keptMask: boolean[]): number {
  const activeDice = dice.filter((_, i) => keptMask[i]);
  const gold = countFace(activeDice, 6);
  const diamonds = countFace(activeDice, 5);
  const sabers = countFace(activeDice, 2);
  const multiplier = sabers >= 3 ? 2 : 1;
  return (gold * 3 + diamonds * 1) * multiplier;
}

export function initialState(seed: number, settings: PirateDiceSettings): PirateDiceState {
  return {
    settings,
    rngSeed: seed,
    treasure: 0,
    turnTreasure: 0,
    skulls: 0,
    keptMask: [false, false, false, false, false],
    lastRoll: [1, 1, 1, 1, 1],
    turnsPlayed: 0,
    phase: "preRoll",
  };
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

export function reducer(state: PirateDiceState, action: PirateDiceAction): PirateDiceState {
  if (state.phase === "won") return state;

  const target = parseInt(state.settings.target, 10);

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const newDice = state.lastRoll.map((d, i) =>
        state.keptMask[i] ? d : Math.floor(rng() * 6) + 1,
      );

      // Skulls are always locked — count them
      const newMask = newDice.map((v, i) => state.keptMask[i] || v === 1);
      const totalSkulls = newDice.filter((v) => v === 1).length +
        state.lastRoll.filter((v, i) => state.keptMask[i] && v === 1).length;

      // Actually just count skulls in full updated dice with mask
      const skullsNow = newDice.filter((v, i) => newMask[i] && v === 1).length;

      if (skullsNow >= 3) {
        return {
          ...state,
          rngSeed: newSeed,
          lastRoll: newDice,
          keptMask: newMask,
          skulls: skullsNow,
          turnTreasure: 0,
          turnsPlayed: state.turnsPlayed + 1,
          phase: "sunk",
        };
      }

      const turnTreasure = calcTurnScore(newDice, newMask);

      return {
        ...state,
        rngSeed: newSeed,
        lastRoll: newDice,
        keptMask: newMask,
        skulls: skullsNow,
        turnTreasure,
        phase: "rolled",
      };
    }

    case "toggleKeep": {
      if (state.phase !== "rolled") return state;
      const { index } = action;
      if (index < 0 || index >= 5) return state;
      // Can't un-keep a skull (face=1) or a skull-locked die
      if (state.lastRoll[index] === 1) return state;

      const newMask = [...state.keptMask];
      newMask[index] = !newMask[index];

      const turnTreasure = calcTurnScore(state.lastRoll, newMask);

      return { ...state, keptMask: newMask, turnTreasure };
    }

    case "bank": {
      if (state.phase !== "rolled") return state;

      const newTreasure = state.treasure + state.turnTreasure;
      const won = newTreasure >= target;

      return {
        ...state,
        treasure: newTreasure,
        turnTreasure: 0,
        skulls: 0,
        keptMask: [false, false, false, false, false],
        lastRoll: [1, 1, 1, 1, 1],
        turnsPlayed: state.turnsPlayed + 1,
        phase: won ? "won" : "preRoll",
      };
    }

    case "nextTurn": {
      if (state.phase !== "sunk") return state;
      return {
        ...state,
        skulls: 0,
        turnTreasure: 0,
        keptMask: [false, false, false, false, false],
        lastRoll: [1, 1, 1, 1, 1],
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PirateDiceState): { score: number } | null {
  if (state.phase !== "won") return null;
  return { score: Math.max(0, 1000 - state.turnsPlayed * 20) };
}
