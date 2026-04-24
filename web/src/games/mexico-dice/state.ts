import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MexicoSettings {
  lives: "3" | "5";
}

/**
 * Mexico (Mia) dice game.
 * Two dice, roll up to 3 times. Best value wins round.
 * Rankings (highest to lowest):
 *   Mexico (1,2) = 21 → rank 100
 *   Doubles: 6,6=66 6,5=55 ... 1,1=11 → rank 66-11 as face value
 *   Others: sorted by tens digit then ones: 65,64,...,31 → rank 6.5, 6.4 etc
 */

export type Phase = "playerRolling" | "botRolling" | "roundOver" | "gameOver";

export interface MexicoState {
  settings: MexicoSettings;
  rngSeed: number;
  playerLives: number;
  botLives: number;
  dice: [number, number];
  botDice: [number, number];
  rerolls: number;
  botRerolls: number;
  phase: Phase;
  roundResult: string | null;
  roundNum: number;
}

export type MexicoAction =
  | { type: "roll" }
  | { type: "keep" }
  | { type: "nextRound" };

function rollTwo(seed: number): { d1: number; d2: number; nextSeed: number } {
  let s = seed >>> 0;
  const rng1 = mulberry32(s);
  const v1 = rng1();
  s = (Math.floor(v1 * 2 ** 31)) >>> 0;
  const rng2 = mulberry32(s);
  const v2 = rng2();
  const ns = (Math.floor(v2 * 2 ** 31)) >>> 0;
  const rngA = mulberry32(seed);
  const d1 = Math.floor(rngA() * 6) + 1;
  const rngB = mulberry32(s);
  const d2 = Math.floor(rngB() * 6) + 1;
  return { d1, d2, nextSeed: ns };
}

function diceRank(d1: number, d2: number): number {
  const hi = Math.max(d1, d2);
  const lo = Math.min(d1, d2);
  // Mexico = 2,1
  if (hi === 2 && lo === 1) return 1000;
  // Doubles
  if (hi === lo) return hi * 11;
  // Others: rank by tens+ones as two-digit number
  return hi * 10 + lo;
}

function diceLabel(d1: number, d2: number): string {
  const hi = Math.max(d1, d2);
  const lo = Math.min(d1, d2);
  if (hi === 2 && lo === 1) return "Mexico!";
  if (hi === lo) return `Doubles ${hi}`;
  return `${hi}-${lo}`;
}

function botPlay(seed: number): { d1: number; d2: number; rerolls: number; nextSeed: number } {
  // Bot strategy: keep if rank >= 55 (doubles 5 or mexico), else reroll up to 2 more times
  let { d1, d2, nextSeed } = rollTwo(seed);
  let rerolls = 0;
  for (let i = 0; i < 2; i++) {
    if (diceRank(d1, d2) >= 55) break;
    const r = rollTwo(nextSeed);
    d1 = r.d1; d2 = r.d2; nextSeed = r.nextSeed;
    rerolls++;
  }
  return { d1, d2, rerolls, nextSeed };
}

export function initialState(seed: number, settings: MexicoSettings): MexicoState {
  const lives = Number(settings.lives);
  return {
    settings,
    rngSeed: seed >>> 0,
    playerLives: lives,
    botLives: lives,
    dice: [0, 0],
    botDice: [0, 0],
    rerolls: 0,
    botRerolls: 0,
    phase: "playerRolling",
    roundResult: null,
    roundNum: 1,
  };
}

export function reducer(state: MexicoState, action: MexicoAction): MexicoState {
  switch (action.type) {
    case "roll": {
      if (state.phase !== "playerRolling") return state;
      const { d1, d2, nextSeed } = rollTwo(state.rngSeed);
      const newRerolls = state.rerolls + 1;
      // After first roll, player can roll up to 3 times total then must keep
      return {
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        rerolls: newRerolls,
        // After 3 rolls, force keep
        phase: newRerolls >= 3 ? "botRolling" : "playerRolling",
      };
    }

    case "keep": {
      if (state.phase !== "playerRolling" || state.rerolls === 0) return state;
      // Player keeps; bot takes its turn
      return { ...state, phase: "botRolling" };
    }

    case "nextRound": {
      if (state.phase === "botRolling") {
        // Run bot turn
        const { d1, d2, rerolls, nextSeed } = botPlay(state.rngSeed);
        const playerRank = diceRank(state.dice[0], state.dice[1]);
        const botRank = diceRank(d1, d2);

        let playerLives = state.playerLives;
        let botLives = state.botLives;
        let result = "";

        if (botRank > playerRank) {
          playerLives--;
          result = `Bot wins round with ${diceLabel(d1, d2)} vs your ${diceLabel(state.dice[0], state.dice[1])}. You lose a life.`;
        } else if (playerRank > botRank) {
          botLives--;
          result = `You win round with ${diceLabel(state.dice[0], state.dice[1])} vs bot's ${diceLabel(d1, d2)}. Bot loses a life.`;
        } else {
          result = `Tie! Both rolled ${diceLabel(state.dice[0], state.dice[1])}. No lives lost.`;
        }

        const gameOver = playerLives <= 0 || botLives <= 0;
        return {
          ...state,
          rngSeed: nextSeed,
          botDice: [d1, d2],
          botRerolls: rerolls,
          playerLives,
          botLives,
          roundResult: result,
          phase: gameOver ? "gameOver" : "roundOver",
        };
      }

      if (state.phase === "roundOver") {
        return {
          ...state,
          dice: [0, 0],
          botDice: [0, 0],
          rerolls: 0,
          botRerolls: 0,
          roundResult: null,
          roundNum: state.roundNum + 1,
          phase: "playerRolling",
        };
      }

      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: MexicoState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  // Score: surviving lives (higher = better)
  return { score: state.playerLives };
}
