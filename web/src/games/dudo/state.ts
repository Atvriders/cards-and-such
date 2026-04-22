import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface DudoSettings {
  startingDice: "3" | "4" | "5";
}

export type Phase = "bid" | "reveal" | "gameOver";

export interface DudoState {
  settings: DudoSettings;
  rngSeed: number;
  playerDice: number;
  botDice: number;
  playerRoll: DieFace[];
  botRoll: DieFace[];
  currentBid: { count: number; face: DieFace; by: 0 | 1 } | null;
  turn: 0 | 1;
  phase: Phase;
  round: number;
  lastReveal: {
    playerRoll: DieFace[];
    botRoll: DieFace[];
    actualCount: number;
    bid: { count: number; face: DieFace; by: 0 | 1 };
    calledBy: 0 | 1;
    loser: 0 | 1;
  } | null;
  winner: 0 | 1 | null;
  message: string;
}

export type DudoAction =
  | { type: "bid"; count: number; face: DieFace }
  | { type: "dudo" };

function rollN(n: number, seed: number): { dice: DieFace[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    dice.push((Math.floor(rng() * 6) + 1) as DieFace);
  }
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { dice, nextSeed };
}

/** Count face F across rolls — ones wild unless F=1 */
function countWithWilds(rolls: DieFace[][], face: DieFace): number {
  let count = 0;
  for (const dice of rolls) {
    for (const d of dice) {
      if (d === face || (face !== 1 && d === 1)) count++;
    }
  }
  return count;
}

function botDecide(state: DudoState): DudoAction {
  const bid = state.currentBid;
  const totalDice = state.playerDice + state.botDice;
  const botFaceCount = (face: DieFace) =>
    state.botRoll.filter((d) => d === face || (face !== 1 && d === 1)).length;

  if (!bid) {
    // Opening bid
    const best = [1, 2, 3, 4, 5, 6].reduce(
      (acc, f) => {
        const c = botFaceCount(f as DieFace);
        return c > acc.count ? { count: c, face: f as DieFace } : acc;
      },
      { count: 0, face: 1 as DieFace },
    );
    return { type: "bid", count: Math.max(1, best.count), face: best.face };
  }

  const { count, face } = bid;
  const known = botFaceCount(face);
  const otherDice = state.playerDice;
  const expected = known + otherDice * (face !== 1 ? 2 : 1) / 6;

  if (count > expected * 1.5) {
    return { type: "dudo" };
  }

  const next: DudoAction =
    face < 6
      ? { type: "bid", count, face: (face + 1) as DieFace }
      : { type: "bid", count: count + 1, face: 1 };

  if (next.type === "bid" && next.count > totalDice) {
    return { type: "dudo" };
  }
  return next;
}

export function initialState(seed: number, settings: DudoSettings): DudoState {
  const n = parseInt(settings.startingDice, 10);
  const { dice: playerRoll, nextSeed: s2 } = rollN(n, seed >>> 0);
  const { dice: botRoll, nextSeed: s3 } = rollN(n, s2);
  return {
    settings,
    rngSeed: s3,
    playerDice: n,
    botDice: n,
    playerRoll,
    botRoll,
    currentBid: null,
    turn: 0,
    phase: "bid",
    round: 1,
    lastReveal: null,
    winner: null,
    message: "Make your opening bid or wait for the bot.",
  };
}

function startNewRound(state: DudoState, firstTurn: 0 | 1): DudoState {
  const { dice: playerRoll, nextSeed: s2 } = rollN(state.playerDice, state.rngSeed);
  const { dice: botRoll, nextSeed: s3 } = rollN(state.botDice, s2);
  return {
    ...state,
    rngSeed: s3,
    playerRoll,
    botRoll,
    currentBid: null,
    turn: firstTurn,
    phase: "bid",
    round: state.round + 1,
    message: "New round!",
  };
}

export function reducer(state: DudoState, action: DudoAction): DudoState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  if (action.type === "bid") {
    const { count, face } = action;
    const totalDice = state.playerDice + state.botDice;
    if (count < 1 || count > totalDice * 2) return state;
    if (face < 1 || face > 6) return state;
    if (state.currentBid) {
      const cur = state.currentBid;
      const valid = count > cur.count || (count === cur.count && face > cur.face);
      if (!valid) return state;
    }

    const withBid: DudoState = {
      ...state,
      currentBid: { count, face, by: 0 },
      turn: 1,
      message: `You bid ${count}×${face}s. Bot deciding...`,
    };

    // Bot's turn
    const botAction = botDecide(withBid);
    if (botAction.type === "dudo") {
      return resolveChallenge(withBid, 1);
    }

    // Bot raises
    const { count: bc, face: bf } = botAction;
    const cur = withBid.currentBid!;
    const valid = bc > cur.count || (bc === cur.count && bf > cur.face);
    if (!valid) return resolveChallenge(withBid, 1);

    return {
      ...withBid,
      currentBid: { count: bc, face: bf, by: 1 },
      turn: 0,
      message: `Bot bids ${bc}×${bf}s. Your turn!`,
    };
  }

  if (action.type === "dudo") {
    if (!state.currentBid) return state;
    return resolveChallenge(state, 0);
  }

  return state;
}

function resolveChallenge(state: DudoState, calledBy: 0 | 1): DudoState {
  if (!state.currentBid) return state;
  const { count, face, by: bidder } = state.currentBid;
  const actual = countWithWilds([state.playerRoll, state.botRoll], face);
  const bidSuccess = actual >= count;
  const loser: 0 | 1 = bidSuccess ? calledBy : bidder;

  const newPlayerDice = state.playerDice - (loser === 0 ? 1 : 0);
  const newBotDice = state.botDice - (loser === 1 ? 1 : 0);

  const lastReveal = {
    playerRoll: state.playerRoll,
    botRoll: state.botRoll,
    actualCount: actual,
    bid: state.currentBid,
    calledBy,
    loser,
  };

  const msg = bidSuccess
    ? `Dudo failed! Actual: ${actual}×${face}s — bid was right. ${loser === 0 ? "You lose" : "Bot loses"} a die.`
    : `Dudo! Actual: ${actual}×${face}s — bid was wrong. ${loser === 0 ? "You lose" : "Bot loses"} a die.`;

  if (newPlayerDice <= 0) {
    return { ...state, playerDice: 0, botDice: newBotDice, lastReveal, winner: 1, phase: "gameOver", message: "Bot wins!" };
  }
  if (newBotDice <= 0) {
    return { ...state, playerDice: newPlayerDice, botDice: 0, lastReveal, winner: 0, phase: "gameOver", message: "You win!" };
  }

  const firstTurn = loser;
  const s2 = startNewRound(
    { ...state, playerDice: newPlayerDice, botDice: newBotDice, lastReveal, message: msg },
    firstTurn,
  );
  if (firstTurn === 1) {
    // Bot goes first in new round — bot makes opening bid
    const botAction = botDecide(s2);
    if (botAction.type === "bid") {
      return { ...s2, currentBid: { ...botAction, by: 1 }, turn: 0, message: `Bot bids ${botAction.count}×${botAction.face}s.` };
    }
    // Bot can't bid on empty round — just return
    return s2;
  }
  return s2;
}

export function isTerminal(state: DudoState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
