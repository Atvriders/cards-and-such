import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Kingdoms Dice: Roll 3 dice, buy a kingdom from the row by spending a matching die.
// Kingdoms have rank 1-6 and value 1-6. Die face must match kingdom rank to buy.
// First player to reach the target score wins.

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface Kingdom {
  rank: DieFace;   // required die face to purchase
  value: number;   // points scored when bought
}

export interface KingdomsDiceSettings {
  targetScore: "30" | "50" | "100";
}

export type Phase = "roll" | "buy" | "botTurn" | "gameOver";

export interface KingdomsDiceState {
  settings: KingdomsDiceSettings;
  rngSeed: number;
  targetScore: number;
  playerScore: number;
  botScore: number;
  dice: DieFace[];
  /** 4 kingdoms visible in the market row */
  market: Kingdom[];
  /** Queue of upcoming kingdoms (seeded) */
  kingdomQueue: Kingdom[];
  turn: 0 | 1; // 0 = player, 1 = bot
  phase: Phase;
  botDice: DieFace[];
  lastBotAction: string | null;
  winner: 0 | 1 | null;
  message: string;
}

export type KingdomsDiceAction =
  | { type: "roll" }
  | { type: "buy"; dieIndex: number; marketIndex: number }
  | { type: "pass" };

function rollN(n: number, rng: () => number): DieFace[] {
  return Array.from({ length: n }, () => (Math.floor(rng() * 6) + 1) as DieFace);
}

function buildQueue(seed: number, size: number): { queue: Kingdom[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const queue: Kingdom[] = [];
  for (let i = 0; i < size; i++) {
    const rank = (Math.floor(rng() * 6) + 1) as DieFace;
    const value = Math.floor(rng() * 6) + 1;
    queue.push({ rank, value });
  }
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { queue, nextSeed };
}

function drawFromQueue(
  queue: Kingdom[],
  rngSeed: number,
): { kingdom: Kingdom; newQueue: Kingdom[]; newSeed: number } {
  if (queue.length > 0) {
    const [kingdom, ...rest] = queue;
    return { kingdom: kingdom!, newQueue: rest, newSeed: rngSeed };
  }
  // Refill queue
  const { queue: newQ, nextSeed } = buildQueue(rngSeed, 20);
  const [kingdom, ...rest] = newQ;
  return { kingdom: kingdom!, newQueue: rest, newSeed: nextSeed };
}

function refillMarket(
  market: Kingdom[],
  queue: Kingdom[],
  rngSeed: number,
): { market: Kingdom[]; queue: Kingdom[]; newSeed: number } {
  let m = [...market];
  let q = [...queue];
  let seed = rngSeed;
  while (m.length < 4) {
    const { kingdom, newQueue, newSeed } = drawFromQueue(q, seed);
    m = [...m, kingdom];
    q = newQueue;
    seed = newSeed;
  }
  return { market: m, queue: q, newSeed: seed };
}

export function initialState(seed: number, settings: KingdomsDiceSettings): KingdomsDiceState {
  const target = parseInt(settings.targetScore, 10);
  const rng = mulberry32(seed >>> 0);
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;

  const { queue, nextSeed: s2 } = buildQueue(nextSeed, 30);
  const { market, queue: q2, newSeed: s3 } = refillMarket([], queue, s2);

  return {
    settings,
    rngSeed: s3,
    targetScore: target,
    playerScore: 0,
    botScore: 0,
    dice: [],
    market,
    kingdomQueue: q2,
    turn: 0,
    phase: "roll",
    botDice: [],
    lastBotAction: null,
    winner: null,
    message: "Roll 3 dice, then buy a kingdom by matching a die to its rank.",
  };
}

function runBotTurn(state: KingdomsDiceState): KingdomsDiceState {
  let s = state;
  // Roll 3 dice
  const rng = mulberry32(s.rngSeed);
  const botDice = rollN(3, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  s = { ...s, rngSeed: nextSeed, botDice };

  // Find best buy: highest-value kingdom that can be bought
  let bestBuy: { dieIdx: number; mktIdx: number; value: number } | null = null;
  for (let mi = 0; mi < s.market.length; mi++) {
    const k = s.market[mi]!;
    for (let di = 0; di < botDice.length; di++) {
      if (botDice[di] === k.rank) {
        if (!bestBuy || k.value > bestBuy.value) {
          bestBuy = { dieIdx: di, mktIdx: mi, value: k.value };
        }
      }
    }
  }

  if (bestBuy) {
    // Buy it
    const newMarket = s.market.filter((_, i) => i !== bestBuy!.mktIdx);
    const { market, queue, newSeed } = refillMarket(newMarket, s.kingdomQueue, s.rngSeed);
    const newBotScore = s.botScore + bestBuy.value;

    if (newBotScore >= s.targetScore) {
      return {
        ...s,
        market,
        kingdomQueue: queue,
        rngSeed: newSeed,
        botScore: newBotScore,
        turn: 0,
        phase: "gameOver",
        winner: 1,
        lastBotAction: `Bot bought rank-${s.market[bestBuy.mktIdx]!.rank} kingdom for ${bestBuy.value} pts.`,
        message: "Bot wins!",
      };
    }

    return {
      ...s,
      market,
      kingdomQueue: queue,
      rngSeed: newSeed,
      botScore: newBotScore,
      turn: 0,
      phase: "roll",
      lastBotAction: `Bot bought rank-${s.market[bestBuy.mktIdx]!.rank} kingdom for ${bestBuy.value} pts.`,
      message: "Your turn!",
    };
  }

  // No match — pass
  return {
    ...s,
    turn: 0,
    phase: "roll",
    lastBotAction: `Bot rolled [${botDice.join(",")}] — no matching kingdom, passed.`,
    message: "Your turn!",
  };
}

export function reducer(state: KingdomsDiceState, action: KingdomsDiceAction): KingdomsDiceState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "roll") return state;
      if (state.turn !== 0) return state;

      const rng = mulberry32(state.rngSeed);
      const dice = rollN(3, rng);
      const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;

      // Check if any die can buy any kingdom
      const hasBuy = state.market.some((k) => dice.includes(k.rank));

      return {
        ...state,
        rngSeed: nextSeed,
        dice,
        phase: "buy",
        message: hasBuy ? "Select a die and a kingdom to buy!" : "No matching kingdoms — pass your turn.",
      };
    }

    case "buy": {
      if (state.phase !== "buy") return state;
      if (state.turn !== 0) return state;
      const { dieIndex, marketIndex } = action;
      if (dieIndex < 0 || dieIndex >= state.dice.length) return state;
      if (marketIndex < 0 || marketIndex >= state.market.length) return state;

      const die = state.dice[dieIndex]!;
      const kingdom = state.market[marketIndex]!;
      if (die !== kingdom.rank) return state;

      const newMarket = state.market.filter((_, i) => i !== marketIndex);
      const { market, queue, newSeed } = refillMarket(newMarket, state.kingdomQueue, state.rngSeed);
      const newPlayerScore = state.playerScore + kingdom.value;

      if (newPlayerScore >= state.targetScore) {
        return {
          ...state,
          market,
          kingdomQueue: queue,
          rngSeed: newSeed,
          playerScore: newPlayerScore,
          dice: [],
          phase: "gameOver",
          winner: 0,
          message: `You win! Scored ${kingdom.value} pts. Total: ${newPlayerScore}.`,
        };
      }

      const afterBuy: KingdomsDiceState = {
        ...state,
        market,
        kingdomQueue: queue,
        rngSeed: newSeed,
        playerScore: newPlayerScore,
        dice: [],
        turn: 1,
        phase: "botTurn",
        message: `Bought rank-${kingdom.rank} kingdom for ${kingdom.value} pts! Bot's turn...`,
      };

      return runBotTurn(afterBuy);
    }

    case "pass": {
      if (state.phase !== "buy") return state;
      if (state.turn !== 0) return state;

      const afterPass: KingdomsDiceState = {
        ...state,
        dice: [],
        turn: 1,
        phase: "botTurn",
        message: "Passed. Bot's turn...",
      };

      return runBotTurn(afterPass);
    }

    default:
      return state;
  }
}

export function isTerminal(state: KingdomsDiceState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? state.playerScore : 0 };
}
