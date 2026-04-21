import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface LiarsDiceSettings {
  startingDice: "3" | "4" | "5";
  botAggressiveness: "cautious" | "balanced" | "aggressive";
}

export interface LiarsDiceState {
  settings: LiarsDiceSettings;
  playerDice: readonly DieFace[];
  botDice: readonly DieFace[];
  currentBid: { count: number; face: DieFace; by: 0 | 1 } | null;
  turn: 0 | 1;
  round: number;
  rngSeed: number;
  lastReveal: null | {
    playerDice: readonly DieFace[];
    botDice: readonly DieFace[];
    actualCount: number;
    called: 0 | 1;
    wonBy: 0 | 1;
    loserDiceLost: 0 | 1;
  };
  winner: 0 | 1 | null;
}

export type LiarsDiceAction =
  | { type: "bid"; count: number; face: DieFace }
  | { type: "call" };

/** Roll n dice using the RNG; returns new dice and updated seed */
function rollDice(n: number, seed: number): { dice: DieFace[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    dice.push((Math.floor(rng() * 6) + 1) as DieFace);
  }
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { dice, nextSeed };
}

/** Count occurrences of `face` in `dice` */
function countFace(dice: readonly DieFace[], face: DieFace): number {
  return dice.filter(d => d === face).length;
}

/** Compute the aggressiveness threshold multiplier */
function aggressivenessThreshold(aggressiveness: "cautious" | "balanced" | "aggressive"): number {
  switch (aggressiveness) {
    case "cautious":    return 1.1;
    case "aggressive":  return 1.5;
    default:            return 1.3; // balanced
  }
}

/**
 * Bot decision: call or raise.
 * Returns either { type: "call" } or { type: "bid", count, face }
 */
function botDecide(
  state: LiarsDiceState,
  bid: { count: number; face: DieFace; by: 0 | 1 },
): LiarsDiceAction {
  const threshold = aggressivenessThreshold(state.settings.botAggressiveness);
  const totalDice = state.playerDice.length + state.botDice.length;
  const botKnownCount = countFace(state.botDice, bid.face);
  // Expected count of face across opponent dice
  const expected = botKnownCount + state.playerDice.length / 6;

  if (bid.count > threshold * expected) {
    // Likely a bluff — call
    return { type: "call" };
  }

  // Try to raise: prefer same face with higher count, else higher face
  const newCount = bid.count + 1;
  if (newCount <= totalDice) {
    return { type: "bid", count: newCount, face: bid.face };
  }

  // Try next face at same or lower count
  for (let f = (bid.face + 1) as DieFace; f <= 6; f = (f + 1) as DieFace) {
    return { type: "bid", count: bid.count, face: f as DieFace };
  }

  // No valid raise — must call
  return { type: "call" };
}

export function initialState(seed: number, settings: LiarsDiceSettings): LiarsDiceState {
  const startingDice = parseInt(settings.startingDice, 10);
  const { dice: playerDice, nextSeed: seed2 } = rollDice(startingDice, seed >>> 0);
  const { dice: botDice, nextSeed: seed3 } = rollDice(startingDice, seed2);

  return {
    settings,
    playerDice,
    botDice,
    currentBid: null,
    turn: 0,
    round: 1,
    rngSeed: seed3,
    lastReveal: null,
    winner: null,
  };
}

function startNewRound(
  state: LiarsDiceState,
  newPlayerDice: number,
  newBotDice: number,
  firstTurn: 0 | 1,
): LiarsDiceState {
  const { dice: playerDice, nextSeed: seed2 } = rollDice(newPlayerDice, state.rngSeed);
  const { dice: botDice, nextSeed: seed3 } = rollDice(newBotDice, seed2);
  return {
    ...state,
    playerDice,
    botDice,
    currentBid: null,
    turn: firstTurn,
    round: state.round + 1,
    rngSeed: seed3,
    lastReveal: state.lastReveal, // keep for display until next action
  };
}

export function reducer(state: LiarsDiceState, action: LiarsDiceAction): LiarsDiceState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "bid": {
      // Only player (seat 0) can bid on their turn
      if (state.turn !== 0) return state;
      const { count, face } = action;
      if (count < 1 || face < 1 || face > 6) return state;

      // Validate raise
      if (state.currentBid !== null) {
        const cur = state.currentBid;
        const valid =
          count > cur.count ||
          (count === cur.count && face > cur.face);
        if (!valid) return state;
      }

      const newBid = { count, face, by: 0 as const };
      // Flip to bot turn, then run bot atomically
      const afterPlayerBid: LiarsDiceState = {
        ...state,
        currentBid: newBid,
        turn: 1,
        lastReveal: null,
      };

      return runBotTurn(afterPlayerBid);
    }

    case "call": {
      // Only player (seat 0) can call, must have a current bid, must be their turn
      if (state.turn !== 0) return state;
      if (state.currentBid === null) return state;

      return resolveCall(state, 0);
    }

    default:
      return state;
  }
}

/** Run the bot's turn after player bids. Bot may raise or call. */
function runBotTurn(state: LiarsDiceState): LiarsDiceState {
  if (state.currentBid === null) return state;

  const action = botDecide(state, state.currentBid);

  if (action.type === "call") {
    // Bot calls — player (bidder by:0) may win or lose
    return resolveCall(state, 1);
  }

  // Bot raises
  const { count, face } = action;
  // Validate raise
  const cur = state.currentBid;
  const valid = count > cur.count || (count === cur.count && face > cur.face);
  if (!valid) {
    // Force call if raise invalid
    return resolveCall(state, 1);
  }

  return {
    ...state,
    currentBid: { count, face, by: 1 },
    turn: 0,
  };
}

/** Resolve a "call" action by `caller` (0 = player called bot's bid, 1 = bot called player's bid). */
function resolveCall(state: LiarsDiceState, caller: 0 | 1): LiarsDiceState {
  if (state.currentBid === null) return state;

  const { count: bidCount, face: bidFace, by: bidder } = state.currentBid;
  const allDice = [...state.playerDice, ...state.botDice];
  const actualCount = countFace(allDice as DieFace[], bidFace);

  // If actual >= bid count, bidder was honest → caller loses a die
  // Else caller wins → bidder loses a die
  const callerWins = actualCount < bidCount;
  const loser: 0 | 1 = callerWins ? bidder : caller;
  const wonBy: 0 | 1 = callerWins ? caller : bidder;

  const newPlayerCount = state.playerDice.length - (loser === 0 ? 1 : 0);
  const newBotCount    = state.botDice.length    - (loser === 1 ? 1 : 0);

  const lastReveal = {
    playerDice: state.playerDice,
    botDice: state.botDice,
    actualCount,
    called: caller,
    wonBy,
    loserDiceLost: loser,
  };

  // Check winner
  if (newPlayerCount <= 0) {
    return { ...state, lastReveal, winner: 1, currentBid: null };
  }
  if (newBotCount <= 0) {
    return { ...state, lastReveal, winner: 0, currentBid: null };
  }

  // Start new round — loser goes first
  return startNewRound(
    { ...state, lastReveal },
    newPlayerCount,
    newBotCount,
    loser,
  );
}

export function isTerminal(state: LiarsDiceState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) {
    return { score: 100 + state.playerDice.length * 50 };
  }
  return { score: 0 };
}
