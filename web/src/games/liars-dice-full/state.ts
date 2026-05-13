import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Full Liar's Dice (Perudo / Dudo style) for 4 players (1 human + 3 CPUs).
 *
 * Rules implemented:
 *   - Each player starts with 5 dice. All roll secretly.
 *   - Player to the dealer's left (seat 1, after seat 0 deals initially)
 *     starts; on subsequent rounds the loser of the previous challenge
 *     goes first. (Both common variants — we use "loser starts".)
 *   - On their turn a player either raises the bid (more dice OR same
 *     count with a higher face) or calls "Liar!".
 *   - When called: count every die across all seats; ones count as
 *     wildcards (count toward the claimed face unless the claimed face
 *     is itself 1).
 *   - If actual count >= bid count → caller loses a die; else bidder
 *     loses a die. Player at 0 dice is eliminated.
 *   - Last player with dice wins.
 *
 * CPU strategy: Hurwicz-style mix of optimism/pessimism on a belief
 * formed from visible own dice + expected hidden distribution
 * (binomial mean 1/3 per opposing die when face != 1, else 1/6).
 */
export interface LiarsDiceFullSettings {
  startingDice: "3" | "4" | "5";
  botDifficulty: "easy" | "normal" | "hard";
}

export interface BidInfo {
  count: number;
  face: DieFace;
  by: number; // seat
}

export interface RevealInfo {
  diceBySeat: ReadonlyArray<readonly DieFace[]>;
  bidCount: number;
  bidFace: DieFace;
  bidder: number;
  caller: number;
  actualCount: number;
  loser: number;
  eliminated: boolean;
}

export interface LiarsDiceFullState {
  settings: LiarsDiceFullSettings;
  /** Dice for each seat (0..3). Empty array = eliminated. */
  diceBySeat: ReadonlyArray<readonly DieFace[]>;
  /** Seat whose turn it is. Always points to an active (non-empty) seat. */
  turn: number;
  /** Current bid or null if no bid yet (start of round). */
  currentBid: BidInfo | null;
  /** Round number (1-based). */
  round: number;
  /** Current RNG state (mixed each roll). */
  rngSeed: number;
  /** Reveal info from previous challenge, shown until next bid. */
  lastReveal: RevealInfo | null;
  /** Winner seat once one player remains; null otherwise. */
  winner: number | null;
}

export type LiarsDiceFullAction =
  | { type: "bid"; count: number; face: DieFace }
  | { type: "call" }
  /** Bot tick — drives the next bot in line to act if it's their turn. */
  | { type: "botTick" };

const NUM_PLAYERS = 4;
const HUMAN_SEAT = 0;

function rollDice(n: number, seed: number): { dice: DieFace[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    dice.push((Math.floor(rng() * 6) + 1) as DieFace);
  }
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { dice, nextSeed };
}

/**
 * Count dice matching `face`. Ones (1s) act as wildcards EXCEPT when
 * the bid face itself is 1 — then only literal ones count.
 */
function countFaceWithWilds(dice: readonly DieFace[], face: DieFace): number {
  if (face === 1) return dice.filter((d) => d === 1).length;
  return dice.filter((d) => d === face || d === 1).length;
}

function totalDiceRemaining(state: LiarsDiceFullState): number {
  let n = 0;
  for (const arr of state.diceBySeat) n += arr.length;
  return n;
}

function isActive(state: LiarsDiceFullState, seat: number): boolean {
  return (state.diceBySeat[seat]?.length ?? 0) > 0;
}

/** Returns the next active seat clockwise after `from`, or -1 if none. */
function nextActiveSeat(state: LiarsDiceFullState, from: number): number {
  for (let i = 1; i <= NUM_PLAYERS; i++) {
    const s = (from + i) % NUM_PLAYERS;
    if (isActive(state, s)) return s;
  }
  return -1;
}

function countActive(state: LiarsDiceFullState): number {
  let n = 0;
  for (const a of state.diceBySeat) if (a.length > 0) n++;
  return n;
}

/** Is `b` a strictly higher bid than `a`? */
function isHigherBid(a: BidInfo, count: number, face: DieFace): boolean {
  return count > a.count || (count === a.count && face > a.face);
}

export function initialState(seed: number, settings: LiarsDiceFullSettings): LiarsDiceFullState {
  const startingDice = parseInt(settings.startingDice, 10);
  let s = seed >>> 0;
  const diceBySeat: DieFace[][] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const { dice, nextSeed } = rollDice(startingDice, s);
    diceBySeat.push(dice);
    s = nextSeed;
  }
  return {
    settings,
    diceBySeat,
    // "Player to the dealer's left makes the first bid" — dealer is seat 0
    // by convention, so seat 1 starts.
    turn: 1,
    currentBid: null,
    round: 1,
    rngSeed: s,
    lastReveal: null,
    winner: null,
  };
}

/** Bot probability that the bid is true given the bot's own dice. */
function bidTrueProb(
  bid: BidInfo,
  myDice: readonly DieFace[],
  hiddenDiceCount: number,
): number {
  // wildcard probability for each unknown die
  const p = bid.face === 1 ? 1 / 6 : 2 / 6; // matches face or wildcard 1
  const known = countFaceWithWilds(myDice, bid.face);
  const need = bid.count - known;
  if (need <= 0) return 1;
  if (need > hiddenDiceCount) return 0;
  // Binomial tail: P(X >= need) where X ~ Bin(hidden, p)
  // For small n this is cheap and exact.
  let prob = 0;
  for (let k = need; k <= hiddenDiceCount; k++) {
    prob += binomPmf(hiddenDiceCount, k, p);
  }
  return prob;
}

function binomPmf(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  // C(n,k) * p^k * (1-p)^(n-k)
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - i + 1)) / i;
  return c * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/** Choose the bot's action (raise or call) for a given seat. */
function botDecide(state: LiarsDiceFullState, seat: number): LiarsDiceFullAction {
  const myDice = state.diceBySeat[seat]!;
  const total = totalDiceRemaining(state);
  const hidden = total - myDice.length;

  // Difficulty: Hurwicz alpha (optimism). Higher alpha = more optimistic raiser.
  // Also affects calling threshold.
  const alpha =
    state.settings.botDifficulty === "easy"
      ? 0.7
      : state.settings.botDifficulty === "hard"
        ? 0.55
        : 0.62;
  // Calling threshold: call when prob(bid true) < callThresh.
  const callThresh =
    state.settings.botDifficulty === "easy"
      ? 0.22
      : state.settings.botDifficulty === "hard"
        ? 0.42
        : 0.32;

  if (state.currentBid === null) {
    // Opening bid: pick our most common face and bid 1 + alpha-scaled expected
    // wild contribution from hidden dice.
    let bestFace: DieFace = 2;
    let bestCount = -1;
    for (let f = 2 as DieFace; f <= 6; f = (f + 1) as DieFace) {
      const c = countFaceWithWilds(myDice, f);
      if (c > bestCount) {
        bestCount = c;
        bestFace = f;
      }
    }
    // Also consider 1s but be conservative (no wilds boost on 1s).
    const onesCount = countFaceWithWilds(myDice, 1);
    if (onesCount > bestCount + 1) {
      bestFace = 1;
      bestCount = onesCount;
    }
    const expectedHidden = hidden * (bestFace === 1 ? 1 / 6 : 2 / 6);
    const aim = Math.max(1, Math.floor(bestCount + alpha * expectedHidden));
    return { type: "bid", count: Math.max(1, aim), face: bestFace };
  }

  const bid = state.currentBid;
  const pTrue = bidTrueProb(bid, myDice, hidden);
  if (pTrue < callThresh) {
    return { type: "call" };
  }

  // Choose a minimal valid raise that the bot still rates likely-enough.
  // Candidates: same face higher count, higher face same count, or shift to bot's strong face.
  type Cand = { count: number; face: DieFace; p: number };
  const candidates: Cand[] = [];

  // 1. Same face, count+1
  if (bid.count + 1 <= total) {
    candidates.push({
      count: bid.count + 1,
      face: bid.face,
      p: bidTrueProb({ count: bid.count + 1, face: bid.face, by: seat }, myDice, hidden),
    });
  }

  // 2. Higher face, same count
  for (let f = (bid.face + 1) as DieFace; f <= 6; f = (f + 1) as DieFace) {
    candidates.push({
      count: bid.count,
      face: f,
      p: bidTrueProb({ count: bid.count, face: f, by: seat }, myDice, hidden),
    });
  }

  // 3. Pivot to bot's strong face at minimum valid count
  for (let f = 2 as DieFace; f <= 6; f = (f + 1) as DieFace) {
    const minCount = f > bid.face ? bid.count : bid.count + 1;
    if (minCount > total) continue;
    candidates.push({
      count: minCount,
      face: f,
      p: bidTrueProb({ count: minCount, face: f, by: seat }, myDice, hidden),
    });
  }

  // Hurwicz score = alpha * p + (1 - alpha) * raiseAggression
  // Prefer raises that look "comfortable but not ridiculous".
  let best: Cand | null = null;
  let bestScore = -Infinity;
  for (const c of candidates) {
    // Must be a strict raise
    if (!isHigherBid(bid, c.count, c.face)) continue;
    if (c.count > total) continue;
    // Score: high prob is good; very high prob (waste) slightly penalised.
    const score = alpha * c.p + (1 - alpha) * (1 - Math.abs(c.p - 0.65));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  if (best === null) return { type: "call" };
  // Final sanity: if the only raise we could find has very low prob, call instead.
  if (best.p < callThresh * 0.8) return { type: "call" };
  return { type: "bid", count: best.count, face: best.face };
}

function resolveCall(
  state: LiarsDiceFullState,
  callerSeat: number,
): LiarsDiceFullState {
  if (state.currentBid === null) return state;
  const bid = state.currentBid;
  const allDice: DieFace[] = [];
  for (const arr of state.diceBySeat) for (const d of arr) allDice.push(d);
  const actual = countFaceWithWilds(allDice, bid.face);
  const callerWins = actual < bid.count;
  const loser = callerWins ? bid.by : callerSeat;

  const newDiceBySeat = state.diceBySeat.map((arr, i) =>
    i === loser ? arr.slice(0, Math.max(0, arr.length - 1)) : arr,
  );
  const eliminated = newDiceBySeat[loser]!.length === 0;

  const reveal: RevealInfo = {
    diceBySeat: state.diceBySeat,
    bidCount: bid.count,
    bidFace: bid.face,
    bidder: bid.by,
    caller: callerSeat,
    actualCount: actual,
    loser,
    eliminated,
  };

  // Check for winner
  const activeCount = newDiceBySeat.filter((a) => a.length > 0).length;
  if (activeCount <= 1) {
    const winnerSeat = newDiceBySeat.findIndex((a) => a.length > 0);
    return {
      ...state,
      diceBySeat: newDiceBySeat,
      currentBid: null,
      lastReveal: reveal,
      winner: winnerSeat === -1 ? loser : winnerSeat,
    };
  }

  // Start new round: re-roll all remaining dice, loser starts (or next active if eliminated).
  let nextTurn = loser;
  if (newDiceBySeat[loser]!.length === 0) {
    // loser eliminated → next active seat after loser starts
    const tmp: LiarsDiceFullState = {
      ...state,
      diceBySeat: newDiceBySeat,
    };
    nextTurn = nextActiveSeat(tmp, loser);
  }

  let s = state.rngSeed;
  const rerolled: DieFace[][] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const keep = newDiceBySeat[i]!.length;
    if (keep === 0) {
      rerolled.push([]);
      continue;
    }
    const { dice, nextSeed } = rollDice(keep, s);
    rerolled.push(dice);
    s = nextSeed;
  }

  return {
    ...state,
    diceBySeat: rerolled,
    currentBid: null,
    lastReveal: reveal,
    rngSeed: s,
    turn: nextTurn,
    round: state.round + 1,
  };
}

function applyAction(
  state: LiarsDiceFullState,
  action: LiarsDiceFullAction,
  seat: number,
): LiarsDiceFullState {
  if (state.winner !== null) return state;
  if (!isActive(state, seat)) return state;
  if (state.turn !== seat) return state;

  switch (action.type) {
    case "bid": {
      const { count, face } = action;
      if (count < 1 || face < 1 || face > 6) return state;
      const total = totalDiceRemaining(state);
      if (count > total) return state;
      if (state.currentBid !== null) {
        if (!isHigherBid(state.currentBid, count, face)) return state;
      }
      const nextTurn = nextActiveSeat(state, seat);
      if (nextTurn < 0) return state;
      return {
        ...state,
        currentBid: { count, face, by: seat },
        turn: nextTurn,
        lastReveal: null,
      };
    }
    case "call": {
      if (state.currentBid === null) return state;
      return resolveCall(state, seat);
    }
    default:
      return state;
  }
}

export function reducer(
  state: LiarsDiceFullState,
  action: LiarsDiceFullAction,
): LiarsDiceFullState {
  if (state.winner !== null) return state;

  if (action.type === "botTick") {
    // Drive a single bot decision if it's currently a bot's turn.
    if (state.turn === HUMAN_SEAT) return state;
    if (!isActive(state, state.turn)) return state;
    const decision = botDecide(state, state.turn);
    return applyAction(state, decision, state.turn);
  }

  // Human actions only valid for seat 0.
  if (state.turn !== HUMAN_SEAT) return state;
  return applyAction(state, action, HUMAN_SEAT);
}

export function isTerminal(state: LiarsDiceFullState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === HUMAN_SEAT) {
    const survivors = state.diceBySeat[HUMAN_SEAT]!.length;
    return { score: 200 + survivors * 60 };
  }
  return { score: 0 };
}

export const __test = {
  NUM_PLAYERS,
  HUMAN_SEAT,
  countFaceWithWilds,
  nextActiveSeat,
  countActive,
  botDecide,
  resolveCall,
  applyAction,
};
