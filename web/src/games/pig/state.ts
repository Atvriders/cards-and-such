import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Seat = 0 | 1;

export interface PigState {
  settings: { target: "50" | "100" | "200"; botStrategy: "cautious" | "aggressive" | "hold-at-20" };
  targetScore: number;
  scores: readonly [number, number];
  turn: Seat;
  turnScore: number;
  lastRoll: number | null;
  rolling: boolean;
  rngSeed: number;
  winner: Seat | null;
  /** Human-readable summary of what the bot did on its last turn */
  botMessage: string | null;
}

export type PigAction =
  | { type: "roll" }
  | { type: "bank" };

function botThreshold(strategy: "cautious" | "aggressive" | "hold-at-20"): number {
  switch (strategy) {
    case "cautious": return 15;
    case "hold-at-20": return 20;
    case "aggressive": return 30;
  }
}

/** Roll a single die using mulberry32. Returns { value, nextSeed }. */
function rollOne(seed: number): { value: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v1 = rng(); // consume one value to generate nextSeed
  const nextSeed = Math.floor(v1 * 2 ** 31) >>> 0;
  const rng2 = mulberry32(seed);
  const value = Math.floor(rng2() * 6) + 1;
  return { value, nextSeed };
}

/** Run the bot's entire turn synchronously. Returns updated state with turn=0. */
function playBotTurn(state: PigState): PigState {
  const threshold = botThreshold(state.settings.botStrategy);
  let seed = state.rngSeed;
  let scores = state.scores;
  let botTurnScore = 0;
  let winner: Seat | null = null;
  let botMsg = "";

  while (true) {
    const { value, nextSeed } = rollOne(seed);
    seed = nextSeed;

    if (value === 1) {
      // Busted — lose turn score
      botMsg = `Bot rolled a 1! Turn lost. Bot has ${scores[1]} total.`;
      botTurnScore = 0;
      break;
    }

    botTurnScore += value;

    // Check if bot can win by banking now
    if (scores[1] + botTurnScore >= state.targetScore) {
      const newBotScore = scores[1] + botTurnScore;
      scores = [scores[0], newBotScore] as unknown as readonly [number, number];
      winner = 1;
      botMsg = `Bot banked ${botTurnScore} and reached ${newBotScore}! Bot wins!`;
      botTurnScore = 0;
      break;
    }

    // Check if bot should bank based on strategy
    if (botTurnScore >= threshold) {
      const newBotScore = scores[1] + botTurnScore;
      scores = [scores[0], newBotScore] as unknown as readonly [number, number];
      botMsg = `Bot banked ${botTurnScore}. Bot has ${newBotScore} total.`;
      botTurnScore = 0;
      break;
    }
  }

  return {
    ...state,
    rngSeed: seed,
    scores,
    turn: 0,
    turnScore: 0,
    lastRoll: null,
    winner,
    botMessage: botMsg,
  };
}

export function initialState(
  seed: number,
  s: { target: "50" | "100" | "200"; botStrategy: "cautious" | "aggressive" | "hold-at-20" },
): PigState {
  return {
    settings: s,
    targetScore: Number(s.target),
    scores: [0, 0],
    turn: 0,
    turnScore: 0,
    lastRoll: null,
    rolling: false,
    rngSeed: seed >>> 0,
    winner: null,
    botMessage: null,
  };
}

export function reducer(state: PigState, action: PigAction): PigState {
  switch (action.type) {
    case "roll": {
      // Only human (seat 0) can roll; no-op if game over or not their turn
      if (state.winner !== null || state.turn !== 0) return state;

      const { value, nextSeed } = rollOne(state.rngSeed);

      if (value === 1) {
        // Bust — turn ends, flip to bot
        const afterBust: PigState = {
          ...state,
          rngSeed: nextSeed,
          lastRoll: value,
          turnScore: 0,
          turn: 1 as Seat,
          winner: null,
          botMessage: null,
        };
        // Play bot turn immediately
        return playBotTurn(afterBust);
      }

      // Non-1: add to turn score
      return {
        ...state,
        rngSeed: nextSeed,
        lastRoll: value,
        turnScore: state.turnScore + value,
        botMessage: null,
      };
    }

    case "bank": {
      // Only human can bank, must have turn score > 0
      if (state.winner !== null || state.turn !== 0) return state;
      if (state.turnScore === 0) return state;

      const newHumanScore = state.scores[0] + state.turnScore;
      if (newHumanScore >= state.targetScore) {
        return {
          ...state,
          scores: [newHumanScore, state.scores[1]] as unknown as readonly [number, number],
          turnScore: 0,
          lastRoll: null,
          winner: 0,
          botMessage: null,
        };
      }

      // Flip to bot
      const afterBank: PigState = {
        ...state,
        scores: [newHumanScore, state.scores[1]] as unknown as readonly [number, number],
        turnScore: 0,
        lastRoll: null,
        turn: 1 as Seat,
        winner: null,
        botMessage: null,
      };
      return playBotTurn(afterBank);
    }

    default:
      return state;
  }
}

export function isTerminal(state: PigState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.scores[0] };
}
