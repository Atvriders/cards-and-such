import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KlondikeDiceSettings {
  target: "5" | "7" | "10";
}

export type KlondikePhase = "preRoll" | "rolled" | "bust" | "won";

export interface KlondikeDiceState {
  settings: KlondikeDiceSettings;
  rngSeed: number;
  score: number;
  turnScore: number;
  turnsPlayed: number;
  pile: number; // current accumulated dice total this push
  lastRoll: number; // single die result
  phase: KlondikePhase;
}

export type KlondikeDiceAction =
  | { type: "roll" }
  | { type: "bank" }
  | { type: "nextTurn" };

export function initialState(seed: number, settings: KlondikeDiceSettings): KlondikeDiceState {
  return {
    settings,
    rngSeed: seed,
    score: 0,
    turnScore: 0,
    turnsPlayed: 0,
    pile: 0,
    lastRoll: 0,
    phase: "preRoll",
  };
}

function nextSeed(seed: number): number {
  const rng = mulberry32(seed);
  return Math.floor(rng() * 2 ** 31);
}

function rollDie(seed: number): { value: number; newSeed: number } {
  const rng = mulberry32(seed);
  const value = Math.floor(rng() * 6) + 1;
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { value, newSeed };
}

export function reducer(state: KlondikeDiceState, action: KlondikeDiceAction): KlondikeDiceState {
  if (state.phase === "won") return state;

  const target = parseInt(state.settings.target, 10);

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      const { value, newSeed } = rollDie(state.rngSeed);
      const newPile = state.pile + value;

      if (value === 1) {
        // Rolling a 1 busts the turn
        return {
          ...state,
          rngSeed: newSeed,
          lastRoll: value,
          pile: newPile,
          phase: "bust",
        };
      }

      const newTurnScore = state.turnScore + value;
      const newScore = state.score + value;
      const won = newScore >= target * 10; // target * 10 to make it substantial

      return {
        ...state,
        rngSeed: newSeed,
        lastRoll: value,
        pile: newPile,
        turnScore: newTurnScore,
        score: newScore,
        phase: won ? "won" : "rolled",
      };
    }

    case "bank": {
      if (state.phase !== "rolled") return state;
      if (state.turnScore === 0) return state;

      const won = state.score >= target * 10;

      return {
        ...state,
        rngSeed: nextSeed(state.rngSeed),
        turnsPlayed: state.turnsPlayed + 1,
        pile: 0,
        turnScore: 0,
        lastRoll: 0,
        phase: won ? "won" : "preRoll",
      };
    }

    case "nextTurn": {
      if (state.phase !== "bust") return state;
      return {
        ...state,
        rngSeed: nextSeed(state.rngSeed),
        turnsPlayed: state.turnsPlayed + 1,
        pile: 0,
        turnScore: 0,
        lastRoll: 0,
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: KlondikeDiceState): { score: number } | null {
  if (state.phase !== "won") return null;
  return { score: Math.max(0, 500 - state.turnsPlayed * 5) };
}
