import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Rolling Thunder: push-your-luck dice game.
// Roll up to 5 dice per turn. Any 1s are "thunder" and removed.
// Keep rolling remaining dice for more points, or bank.
// Score = sum of non-1 dice banked. Roll a 1 twice in a row = bust entire score.

export interface RollingThunderState {
  rngSeed: number;
  currentDice: number[];   // active dice this turn (no 1s)
  thunder: number;         // count of 1s rolled this turn
  bankedScore: number;
  turnScore: number;       // sum of current kept dice
  consecutiveThunder: number; // thunder rolls in a row
  gameOver: boolean;
  busted: boolean;
  turns: number;
}

export type RollingThunderAction = { type: "roll" } | { type: "bank" };

const MAX_TURNS = 6;

export function initialState(seed: number): RollingThunderState {
  return {
    rngSeed: seed,
    currentDice: [],
    thunder: 0,
    bankedScore: 0,
    turnScore: 0,
    consecutiveThunder: 0,
    gameOver: false,
    busted: false,
    turns: 0,
  };
}

export function reducer(state: RollingThunderState, action: RollingThunderAction): RollingThunderState {
  if (state.gameOver) return state;

  if (action.type === "bank") {
    if (state.currentDice.length === 0 && state.turns === 0) return state;
    const bankedScore = state.bankedScore + state.turnScore;
    const turns = state.turns + 1;
    const gameOver = turns >= MAX_TURNS;
    return {
      ...state,
      bankedScore,
      turnScore: 0,
      currentDice: [],
      thunder: 0,
      consecutiveThunder: 0,
      turns,
      gameOver,
    };
  }

  if (action.type === "roll") {
    const diceCount = state.currentDice.length === 0 ? 5 : state.currentDice.length;
    const rng = mulberry32(state.rngSeed);
    const rolled = Array.from({ length: diceCount }, () => Math.floor(rng() * 6) + 1);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const thunder = rolled.filter((d) => d === 1).length;
    const surviving = rolled.filter((d) => d !== 1);
    const turnScore = surviving.reduce((a, b) => a + b, 0);
    const consecutive = thunder > 0 ? state.consecutiveThunder + 1 : 0;
    const busted = consecutive >= 2;
    if (busted) {
      const turns = state.turns + 1;
      const gameOver = turns >= MAX_TURNS;
      return {
        ...state,
        rngSeed: nextSeed,
        currentDice: [],
        thunder,
        bankedScore: 0,  // lose all banked
        turnScore: 0,
        consecutiveThunder: consecutive,
        busted: true,
        turns,
        gameOver,
      };
    }
    return {
      ...state,
      rngSeed: nextSeed,
      currentDice: surviving,
      thunder,
      turnScore,
      consecutiveThunder: consecutive,
      busted: false,
    };
  }

  return state;
}

export function isTerminal(state: RollingThunderState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.bankedScore };
}
