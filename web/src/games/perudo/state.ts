import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface PerudoSettings {
  opponents: "1" | "2" | "3";
  startingDice: "4" | "5" | "6";
}

export type Phase = "bid" | "reveal" | "gameOver";

export interface PerudoState {
  settings: PerudoSettings;
  rngSeed: number;
  /** Number of dice each player holds (index 0 = human) */
  diceCounts: number[];
  /** Each player's current roll (hidden from other players in real play) */
  rolls: DieFace[][];
  /** Current bid: how many dice showing face F */
  currentBid: { count: number; face: DieFace; by: number } | null;
  turn: number; // index of player whose turn it is
  phase: Phase;
  round: number;
  lastReveal: {
    rolls: DieFace[][];
    actualCount: number;
    bid: { count: number; face: DieFace; by: number };
    calledBy: number;
    loser: number;
  } | null;
  winner: number | null; // player index
  message: string;
}

export type PerudoAction =
  | { type: "bid"; count: number; face: DieFace }
  | { type: "dudo" }; // challenge

function rollN(n: number, seed: number): { dice: DieFace[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    dice.push((Math.floor(rng() * 6) + 1) as DieFace);
  }
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { dice, nextSeed };
}

/** Count face F across all dice — ones are wild UNLESS F = 1 */
function countWithWilds(rolls: DieFace[][], face: DieFace): number {
  let count = 0;
  for (const playerDice of rolls) {
    for (const d of playerDice) {
      if (d === face || (face !== 1 && d === 1)) count++;
    }
  }
  return count;
}

function rollAll(
  diceCounts: number[],
  seed: number,
): { rolls: DieFace[][]; nextSeed: number } {
  let s = seed;
  const rolls: DieFace[][] = [];
  for (const n of diceCounts) {
    if (n <= 0) {
      rolls.push([]);
    } else {
      const { dice, nextSeed } = rollN(n, s);
      rolls.push(dice);
      s = nextSeed;
    }
  }
  return { rolls, nextSeed: s };
}

/** Minimum valid bid higher than currentBid */
function minNextBid(cur: { count: number; face: DieFace } | null, totalDice: number): { count: number; face: DieFace } {
  if (!cur) return { count: 1, face: 1 };
  // Same face, higher count OR higher face at same/lower count
  // Simplest: same count + higher face, or higher count same face
  if (cur.face < 6) return { count: cur.count, face: (cur.face + 1) as DieFace };
  return { count: cur.count + 1, face: 1 };
}

/** Bot decides: raise or call dudo */
function botDecide(
  state: PerudoState,
  botIdx: number,
): PerudoAction {
  const bid = state.currentBid;
  const botRoll = state.rolls[botIdx] ?? [];
  const totalDice = state.diceCounts.reduce((a, b) => a + b, 0);

  if (!bid) {
    // First bid: count 1s in bot roll as base
    const face = (Math.floor(Math.random() * 6) + 1) as DieFace;
    return { type: "bid", count: 1, face };
  }

  const { count, face } = bid;
  const botKnown = countWithWilds([botRoll], face);
  const otherDice = totalDice - botRoll.length;
  const expected = botKnown + otherDice / 6 + (face !== 1 ? otherDice / 6 : 0);

  if (count > expected * 1.4) {
    return { type: "dudo" };
  }

  // Raise: try same face +1 count, or switch to a face the bot has
  const next = minNextBid(bid, totalDice);
  if (next.count <= totalDice) {
    return { type: "bid", count: next.count, face: next.face };
  }
  return { type: "dudo" };
}

export function initialState(seed: number, settings: PerudoSettings): PerudoState {
  const numPlayers = parseInt(settings.opponents, 10) + 1;
  const startDice = parseInt(settings.startingDice, 10);
  const diceCounts = Array(numPlayers).fill(startDice);
  const { rolls, nextSeed } = rollAll(diceCounts, seed >>> 0);
  return {
    settings,
    rngSeed: nextSeed,
    diceCounts,
    rolls,
    currentBid: null,
    turn: 0,
    phase: "bid",
    round: 1,
    lastReveal: null,
    winner: null,
    message: "Make a bid or call Dudo!",
  };
}

function startNewRound(state: PerudoState, firstTurn: number): PerudoState {
  const { rolls, nextSeed } = rollAll(state.diceCounts, state.rngSeed);
  return {
    ...state,
    rngSeed: nextSeed,
    rolls,
    currentBid: null,
    turn: firstTurn,
    phase: "bid",
    round: state.round + 1,
    message: "New round — make a bid or call Dudo!",
  };
}

function runBots(state: PerudoState): PerudoState {
  let s = state;
  while (s.phase === "bid" && s.turn !== 0 && s.winner === null) {
    const botIdx = s.turn;
    const action = botDecide(s, botIdx);
    s = applyAction(s, action, botIdx);
  }
  return s;
}

function applyAction(state: PerudoState, action: PerudoAction, actorIdx: number): PerudoState {
  if (state.winner !== null) return state;

  if (action.type === "bid") {
    const { count, face } = action;
    const totalDice = state.diceCounts.reduce((a, b) => a + b, 0);
    if (count < 1 || count > totalDice * 2) return state;
    if (face < 1 || face > 6) return state;
    // Validate raise
    if (state.currentBid) {
      const cur = state.currentBid;
      const valid = count > cur.count || (count === cur.count && face > cur.face);
      if (!valid) return state;
    }
    const numPlayers = state.diceCounts.length;
    const nextTurn = (actorIdx + 1) % numPlayers;
    return {
      ...state,
      currentBid: { count, face, by: actorIdx },
      turn: nextTurn,
      message: actorIdx === 0
        ? `You bid ${count}×${face}s.`
        : `Player ${actorIdx} bids ${count}×${face}s.`,
    };
  }

  if (action.type === "dudo") {
    if (!state.currentBid) return state;
    const { count, face, by: bidder } = state.currentBid;
    const actualCount = countWithWilds(state.rolls, face);
    const bidSuccess = actualCount >= count;

    // If bid was accurate: caller loses a die. If bid was wrong: bidder loses a die.
    const loser = bidSuccess ? actorIdx : bidder;
    const newDiceCounts = state.diceCounts.map((n, i) => (i === loser ? n - 1 : n));

    const lastReveal = {
      rolls: state.rolls,
      actualCount,
      bid: state.currentBid,
      calledBy: actorIdx,
      loser,
    };

    const aliveIndices = newDiceCounts
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => n > 0);

    if (aliveIndices.length <= 1) {
      const winnerIdx = aliveIndices[0]?.i ?? 0;
      return {
        ...state,
        diceCounts: newDiceCounts,
        lastReveal,
        winner: winnerIdx,
        phase: "gameOver",
        message:
          bidSuccess
            ? `Dudo! Actual: ${actualCount}×${face}s — bid was right. Caller loses a die. ${winnerIdx === 0 ? "You win!" : `Player ${winnerIdx} wins!`}`
            : `Dudo! Actual: ${actualCount}×${face}s — bid was wrong. Bidder loses a die. ${winnerIdx === 0 ? "You win!" : `Player ${winnerIdx} wins!`}`,
      };
    }

    // Start new round — loser goes first (or next alive)
    const roundFirst = aliveIndices.find((x) => x.i === loser)?.i ?? aliveIndices[0]!.i;
    const msg = bidSuccess
      ? `Dudo failed! Actual: ${actualCount}×${face}s — bid was right. ${loser === 0 ? "You lose" : `Player ${loser} loses`} a die.`
      : `Dudo! Actual: ${actualCount}×${face}s — bid was wrong. ${loser === 0 ? "You lose" : `Player ${loser} loses`} a die.`;

    return startNewRound(
      { ...state, diceCounts: newDiceCounts, lastReveal, message: msg },
      roundFirst,
    );
  }

  return state;
}

export function reducer(state: PerudoState, action: PerudoAction): PerudoState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state; // Only human actions
  const s = applyAction(state, action, 0);
  return runBots(s);
}

export function isTerminal(state: PerudoState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
