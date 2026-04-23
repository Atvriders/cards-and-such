import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Diddler — 2 player. Each turn roll 3 dice, arrange into a 3-digit number.
// Highest wins the round. First to 5 round wins = game win.

export const ROUNDS_TO_WIN = 5;

export interface DiddlerSettings { dummy: boolean }

export interface DiddlerState {
  settings: DiddlerSettings;
  rngSeed: number;
  roundWins: readonly number[];  // [human, bot]
  playerDice: readonly number[]; // human's 3 dice (1-6)
  botDice: readonly number[];    // bot's 3 dice
  playerOrder: readonly number[];// digit order chosen by player (indices into playerDice)
  phase: "rolling" | "arranging" | "result";
  currentPlayer: number;         // 0 = human turn, 1 = bot has gone
  roundResult: string;           // description of last round
  winner: number | null;
}

export type DiddlerAction =
  | { type: "roll" }
  | { type: "setOrder"; order: readonly number[] } // player chooses digit arrangement

function rollDice(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * 6) + 1);
}

function toNumber(dice: readonly number[], order: readonly number[]): number {
  return order.reduce((n, idx) => n * 10 + (dice[idx] ?? 1), 0);
}

function bestBotArrangement(dice: readonly number[]): readonly number[] {
  // Bot tries all permutations, picks the one giving the highest number
  const perms: number[][] = [];
  function perm(arr: number[], current: number[]) {
    if (current.length === arr.length) { perms.push([...current]); return; }
    arr.forEach((_, i) => { if (!current.includes(i)) perm(arr, [...current, i]); });
  }
  perm([...dice], []);
  let best = perms[0]!;
  let bestVal = toNumber(dice, best);
  for (const p of perms) {
    const val = toNumber(dice, p);
    if (val > bestVal) { bestVal = val; best = p; }
  }
  return best;
}

export function initialState(seed: number, settings: DiddlerSettings): DiddlerState {
  return {
    settings,
    rngSeed: seed,
    roundWins: [0, 0],
    playerDice: [1, 1, 1],
    botDice: [1, 1, 1],
    playerOrder: [0, 1, 2],
    phase: "rolling",
    currentPlayer: 0,
    roundResult: "",
    winner: null,
  };
}

export function reducer(state: DiddlerState, action: DiddlerAction): DiddlerState {
  if (state.winner !== null) return state;

  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const playerDice = rollDice(rng, 3);
    const botDice = rollDice(rng, 3);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      rngSeed: nextSeed,
      playerDice,
      botDice,
      playerOrder: [0, 1, 2],
      phase: "arranging",
    };
  }

  if (action.type === "setOrder" && state.phase === "arranging") {
    const order = action.order;
    if (order.length !== 3) return state;
    const botOrder = bestBotArrangement(state.botDice);
    const playerNum = toNumber(state.playerDice, order);
    const botNum = toNumber(state.botDice, botOrder);

    const newWins = [...state.roundWins];
    let roundResult = "";
    if (playerNum > botNum) {
      newWins[0] = newWins[0]! + 1;
      roundResult = `You made ${playerNum}, Bot made ${botNum}. You win the round!`;
    } else if (botNum > playerNum) {
      newWins[1] = newWins[1]! + 1;
      roundResult = `You made ${playerNum}, Bot made ${botNum}. Bot wins the round!`;
    } else {
      roundResult = `Tie! Both made ${playerNum}. No round point.`;
    }

    const winner = newWins[0]! >= ROUNDS_TO_WIN ? 0 : newWins[1]! >= ROUNDS_TO_WIN ? 1 : null;
    return {
      ...state,
      roundWins: newWins,
      playerOrder: order,
      phase: "result",
      roundResult,
      winner,
    };
  }

  if (action.type === "roll" && state.phase === "result") {
    // Start new round
    const rng = mulberry32(state.rngSeed);
    const playerDice = rollDice(rng, 3);
    const botDice = rollDice(rng, 3);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      rngSeed: nextSeed,
      playerDice,
      botDice,
      playerOrder: [0, 1, 2],
      phase: "arranging",
      roundResult: "",
    };
  }

  return state;
}

export function isTerminal(state: DiddlerState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? state.roundWins[0]! * 10 : 0 };
}
