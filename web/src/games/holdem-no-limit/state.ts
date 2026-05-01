import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface HoldemNoLimitSettings {
  startingStack: "500" | "1000" | "2000";
  blinds: "5/10" | "10/20" | "25/50";
}

export type HoldemPhase =
  | "idle"        // waiting to deal first hand
  | "pre-flop"
  | "flop"
  | "turn"
  | "river"
  | "showdown"    // hand over, result on screen — press deal for next
  | "done";       // someone is busted

export type HoldemActionType = "fold" | "check" | "call" | "raise";

export interface HoldemNoLimitState {
  settings: HoldemNoLimitSettings;
  rngSeed: number;

  // chip state
  playerStack: number;
  cpuStack: number;
  pot: number;

  // bets in the current betting round
  playerBet: number;
  cpuBet: number;

  // cards
  deck: Card[];
  playerHole: Card[];
  cpuHole: Card[];
  community: Card[];

  // structure
  smallBlind: number;
  bigBlind: number;
  dealerIsPlayer: boolean;     // dealer/button — also small blind in heads-up
  handsPlayed: number;
  phase: HoldemPhase;
  playerToAct: boolean;

  // tracking who has acted this betting round
  // (used so the big-blind option pre-flop and check-around resolve correctly)
  playerActed: boolean;
  cpuActed: boolean;

  // size of the latest raise on the current street (No-Limit minimum-raise rule)
  lastRaiseSize: number;

  // info
  lastAction: string;
  lastResult: string;

  // for showdown reveal
  showCpuHole: boolean;
}

export type HoldemNoLimitAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; amount: number }; // amount = total chips put in this street, additive to current bet

// ---------- helpers ----------

const CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

export function compareHands(a: Card[], b: Card[]): number {
  const ha = rankHand(a);
  const hb = rankHand(b);
  const ra = CLASS_ORDER.indexOf(ha.class);
  const rb = CLASS_ORDER.indexOf(hb.class);
  if (ra !== rb) return ra - rb;
  for (let i = 0; i < Math.max(ha.kickers.length, hb.kickers.length); i++) {
    const ka = ha.kickers[i] ?? 0;
    const kb = hb.kickers[i] ?? 0;
    if (ka !== kb) return ka - kb;
  }
  return 0;
}

/** Best 5 of n cards (n up to 7). */
export function bestFiveOf(cards: Card[]): Card[] {
  if (cards.length <= 5) return cards;
  const n = cards.length;
  let best: Card[] | null = null;
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++) {
            const five = [cards[a]!, cards[b]!, cards[c]!, cards[d]!, cards[e]!];
            if (!best || compareHands(five, best) > 0) best = five;
          }
  return best ?? cards.slice(0, 5);
}

export function handClass(cards: Card[]): HandClass | "incomplete" {
  if (cards.length < 5) return "incomplete";
  return rankHand(bestFiveOf(cards)).class;
}

function parseBlinds(b: HoldemNoLimitSettings["blinds"]): { small: number; big: number } {
  const [s, big] = b.split("/").map((n) => parseInt(n, 10));
  return { small: s!, big: big! };
}

function nextSeedFrom(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  // burn one to compute the next seed
  const probe = mulberry32(seed);
  const nextSeed = Math.floor(probe() * 2 ** 31);
  return { rng, nextSeed };
}

// ---------- hand strength estimator ----------
// Lightweight Monte Carlo: deal random opponent hole + remaining board, score win rate.
function estimateEquity(
  hole: Card[],
  community: Card[],
  rng: () => number,
  trials = 80,
): number {
  const used = new Set<string>();
  for (const c of hole) used.add(c.id);
  for (const c of community) used.add(c.id);

  // Build remaining deck
  const remaining: Card[] = [];
  for (const c of newDeck(1)) if (!used.has(c.id)) remaining.push(c);

  let wins = 0;
  let ties = 0;
  for (let t = 0; t < trials; t++) {
    // shuffle a copy
    const pool = [...remaining];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = pool[i]!;
      pool[i] = pool[j]!;
      pool[j] = tmp;
    }
    const oppHole = [pool[0]!, pool[1]!];
    const need = 5 - community.length;
    const board = [...community];
    for (let k = 0; k < need; k++) board.push(pool[2 + k]!);

    const my = bestFiveOf([...hole, ...board]);
    const opp = bestFiveOf([...oppHole, ...board]);
    const cmp = compareHands(my, opp);
    if (cmp > 0) wins++;
    else if (cmp === 0) ties++;
  }
  return (wins + ties / 2) / trials;
}

// ---------- core flow ----------

export function initialState(seed: number, settings: HoldemNoLimitSettings): HoldemNoLimitState {
  const stack = parseInt(settings.startingStack, 10);
  const { small, big } = parseBlinds(settings.blinds);
  return {
    settings,
    rngSeed: seed >>> 0,
    playerStack: stack,
    cpuStack: stack,
    pot: 0,
    playerBet: 0,
    cpuBet: 0,
    deck: [],
    playerHole: [],
    cpuHole: [],
    community: [],
    smallBlind: small,
    bigBlind: big,
    dealerIsPlayer: true,
    handsPlayed: 0,
    phase: "idle",
    playerToAct: true,
    playerActed: false,
    cpuActed: false,
    lastRaiseSize: big,
    lastAction: "",
    lastResult: "",
    showCpuHole: false,
  };
}

function dealNewHand(state: HoldemNoLimitState): HoldemNoLimitState {
  if (state.playerStack <= 0 || state.cpuStack <= 0) {
    return { ...state, phase: "done" };
  }
  const { rng, nextSeed } = nextSeedFrom(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);

  // alternate the button (after first hand)
  const dealerIsPlayer = state.handsPlayed === 0 ? true : !state.dealerIsPlayer;

  // heads-up: dealer/button posts SB, opponent posts BB; SB acts first pre-flop
  const sb = state.smallBlind;
  const bb = state.bigBlind;
  const playerPost = dealerIsPlayer ? sb : bb;
  const cpuPost = dealerIsPlayer ? bb : sb;

  const playerStack = state.playerStack - playerPost;
  const cpuStack = state.cpuStack - cpuPost;

  const d1 = deal(deck, 4);
  const playerHole = [d1.drawn[0]!, d1.drawn[2]!];
  const cpuHole = [d1.drawn[1]!, d1.drawn[3]!];

  return {
    ...state,
    rngSeed: nextSeed,
    deck: d1.remaining,
    playerHole,
    cpuHole,
    community: [],
    playerStack,
    cpuStack,
    pot: playerPost + cpuPost,
    playerBet: playerPost,
    cpuBet: cpuPost,
    dealerIsPlayer,
    handsPlayed: state.handsPlayed + 1,
    phase: "pre-flop",
    playerToAct: dealerIsPlayer,   // SB acts first pre-flop
    playerActed: false,
    cpuActed: false,
    lastRaiseSize: bb,             // min open-raise = one BB more
    lastAction: `Blinds posted (SB ${sb}/BB ${bb})`,
    lastResult: "",
    showCpuHole: false,
  };
}

/** Returns true once both players have acted and bets are matched (or one is all-in). */
function bettingRoundClosed(s: HoldemNoLimitState): boolean {
  const matched = s.playerBet === s.cpuBet;
  const allIn = s.playerStack === 0 || s.cpuStack === 0;
  if (!s.playerActed || !s.cpuActed) return false;
  return matched || allIn;
}

function dealStreet(s: HoldemNoLimitState): HoldemNoLimitState {
  // From whichever phase, deal the next set of community cards.
  let community = s.community;
  let deck = s.deck;
  let nextPhase: HoldemPhase = s.phase;
  if (s.phase === "pre-flop") {
    const r = deal(deck, 3);
    community = r.drawn;
    deck = r.remaining;
    nextPhase = "flop";
  } else if (s.phase === "flop") {
    const r = deal(deck, 1);
    community = [...community, ...r.drawn];
    deck = r.remaining;
    nextPhase = "turn";
  } else if (s.phase === "turn") {
    const r = deal(deck, 1);
    community = [...community, ...r.drawn];
    deck = r.remaining;
    nextPhase = "river";
  } else if (s.phase === "river") {
    return resolveShowdown(s);
  }

  // post-flop: BB (non-dealer) acts first
  return {
    ...s,
    deck,
    community,
    phase: nextPhase,
    playerBet: 0,
    cpuBet: 0,
    playerActed: false,
    cpuActed: false,
    lastRaiseSize: s.bigBlind,
    playerToAct: !s.dealerIsPlayer, // BB acts first post-flop
    lastAction: `--- ${nextPhase} ---`,
  };
}

/** If betting closed, advance the street (or run-out if someone all-in). */
function maybeAdvanceStreet(s: HoldemNoLimitState): HoldemNoLimitState {
  if (!bettingRoundClosed(s)) return s;
  // If someone is all-in and bets are matched, run remaining streets without action.
  let cur = s;
  const allIn = cur.playerStack === 0 || cur.cpuStack === 0;
  while (cur.phase !== "showdown" && bettingRoundClosed(cur)) {
    cur = dealStreet(cur);
    if (!allIn) break;        // only auto-runout when someone is all-in
  }
  return cur;
}

function resolveShowdown(s: HoldemNoLimitState): HoldemNoLimitState {
  const playerCards = [...s.playerHole, ...s.community];
  const cpuCards = [...s.cpuHole, ...s.community];
  const pBest = bestFiveOf(playerCards);
  const cBest = bestFiveOf(cpuCards);
  const cmp = compareHands(pBest, cBest);
  let playerStack = s.playerStack;
  let cpuStack = s.cpuStack;
  let lastResult: string;
  const pClass = rankHand(pBest).class;
  const cClass = rankHand(cBest).class;
  if (cmp > 0) {
    playerStack += s.pot;
    lastResult = `You win $${s.pot} with ${pClass}.`;
  } else if (cmp < 0) {
    cpuStack += s.pot;
    lastResult = `CPU wins $${s.pot} with ${cClass}.`;
  } else {
    const half = Math.floor(s.pot / 2);
    playerStack += half;
    cpuStack += s.pot - half;
    lastResult = `Split pot ($${s.pot}). Both ${pClass}.`;
  }
  return {
    ...s,
    phase: "showdown",
    pot: 0,
    playerStack,
    cpuStack,
    lastResult,
    showCpuHole: true,
  };
}

function awardUncalled(s: HoldemNoLimitState, winnerIsPlayer: boolean, reason: string): HoldemNoLimitState {
  const playerStack = winnerIsPlayer ? s.playerStack + s.pot : s.playerStack;
  const cpuStack = winnerIsPlayer ? s.cpuStack : s.cpuStack + s.pot;
  return {
    ...s,
    phase: "showdown",
    pot: 0,
    playerStack,
    cpuStack,
    lastResult: reason,
    showCpuHole: false,
  };
}

// ---------- CPU AI ----------

interface CpuChoice {
  action: HoldemNoLimitAction;
  reason: string;
}

function cpuDecide(s: HoldemNoLimitState): CpuChoice {
  // make an RNG seeded off current state for hand-strength estimate (deterministic)
  const { rng } = nextSeedFrom(s.rngSeed ^ 0x9E3779B9);
  const equity = estimateEquity(s.cpuHole, s.community, rng, 80);

  const toCall = s.playerBet - s.cpuBet;
  const callable = Math.min(toCall, s.cpuStack);

  // Aggression / bluff jitter
  const jitter = (rng() - 0.5) * 0.1;
  const strength = Math.max(0, Math.min(1, equity + jitter));

  // Decide
  if (toCall === 0) {
    // option to check or bet
    if (strength > 0.6 && s.cpuStack > 0) {
      const sizing = strength > 0.85
        ? Math.min(s.cpuStack, Math.max(s.bigBlind * 4, Math.round(s.pot * 0.9)))
        : Math.min(s.cpuStack, Math.max(s.bigBlind * 2, Math.round(s.pot * 0.55)));
      return { action: { type: "raise", amount: sizing }, reason: `CPU bets $${sizing}` };
    }
    return { action: { type: "check" }, reason: "CPU checks" };
  }

  // facing a bet
  if (strength < 0.3) {
    // weak: usually fold; tiny chance to call if cheap
    const potOdds = callable / (s.pot + callable);
    if (potOdds < 0.12 && rng() < 0.4) {
      return { action: { type: "call" }, reason: `CPU calls $${callable}` };
    }
    return { action: { type: "fold" }, reason: "CPU folds" };
  }
  if (strength < 0.6) {
    return { action: { type: "call" }, reason: `CPU calls $${callable}` };
  }
  // strong: raise
  if (s.cpuStack > toCall) {
    const sizing = Math.min(
      s.cpuStack,
      toCall + Math.max(s.lastRaiseSize, Math.round((s.pot + toCall) * 0.7)),
    );
    return { action: { type: "raise", amount: sizing }, reason: `CPU raises to $${sizing}` };
  }
  return { action: { type: "call" }, reason: `CPU calls $${callable}` };
}

function applyCpuTurn(s: HoldemNoLimitState): HoldemNoLimitState {
  // CPU may need to act multiple times in a row if player just raised etc.
  let cur = s;
  // safety bound
  for (let i = 0; i < 6; i++) {
    if (cur.phase === "showdown" || cur.phase === "done" || cur.phase === "idle") return cur;
    if (cur.playerToAct) return cur;
    const choice = cpuDecide(cur);
    cur = applyAction(cur, choice.action, /*isPlayer*/ false, choice.reason);
    if (cur.phase === "showdown" || cur.phase === "done") return cur;
  }
  return cur;
}

function applyAction(
  s: HoldemNoLimitState,
  action: HoldemNoLimitAction,
  isPlayer: boolean,
  label: string,
): HoldemNoLimitState {
  if (action.type === "deal") return s;
  // determine acting party
  const myBet = isPlayer ? s.playerBet : s.cpuBet;
  const oppBet = isPlayer ? s.cpuBet : s.playerBet;
  const myStack = isPlayer ? s.playerStack : s.cpuStack;
  const toCall = oppBet - myBet;

  let next = { ...s };

  if (action.type === "fold") {
    return awardUncalled(s, /*winnerIsPlayer*/ !isPlayer, isPlayer ? "You folded." : "CPU folded.");
  }

  if (action.type === "check") {
    if (toCall > 0) return s; // illegal
    next = applySetActed(next, isPlayer);
    next = { ...next, lastAction: label };
    next = passTurn(next, isPlayer);
    if (bettingRoundClosed(next)) next = maybeAdvanceStreet(next);
    return next;
  }

  if (action.type === "call") {
    const callAmt = Math.max(0, Math.min(toCall, myStack));
    if (isPlayer) {
      next.playerBet += callAmt;
      next.playerStack -= callAmt;
    } else {
      next.cpuBet += callAmt;
      next.cpuStack -= callAmt;
    }
    next.pot += callAmt;
    next = applySetActed(next, isPlayer);
    next = { ...next, lastAction: label };
    next = passTurn(next, isPlayer);
    if (bettingRoundClosed(next)) next = maybeAdvanceStreet(next);
    return next;
  }

  if (action.type === "raise") {
    // amount = total bet on this street going forward. Must beat opp bet by at least lastRaiseSize.
    const desiredTotal = action.amount;
    // clamp to legal range
    const maxTotal = myBet + myStack; // all-in cap
    const minLegal = Math.min(maxTotal, oppBet + Math.max(s.bigBlind, s.lastRaiseSize));
    const total = Math.max(minLegal, Math.min(maxTotal, Math.floor(desiredTotal)));
    const delta = total - myBet;
    if (delta <= 0) return s;
    const raiseSize = total - oppBet; // amount above the previous bet
    if (isPlayer) {
      next.playerBet = total;
      next.playerStack -= delta;
    } else {
      next.cpuBet = total;
      next.cpuStack -= delta;
    }
    next.pot += delta;
    next.lastRaiseSize = Math.max(s.bigBlind, raiseSize);
    // a raise re-opens action: opponent has not acted vs new bet
    if (isPlayer) next.cpuActed = false;
    else next.playerActed = false;
    next = applySetActed(next, isPlayer);
    next = { ...next, lastAction: label };
    next = passTurn(next, isPlayer);
    return next;
  }
  return s;
}

function applySetActed(s: HoldemNoLimitState, isPlayer: boolean): HoldemNoLimitState {
  return isPlayer ? { ...s, playerActed: true } : { ...s, cpuActed: true };
}

function passTurn(s: HoldemNoLimitState, justActedIsPlayer: boolean): HoldemNoLimitState {
  return { ...s, playerToAct: !justActedIsPlayer };
}

// ---------- public reducer ----------

export function reducer(state: HoldemNoLimitState, action: HoldemNoLimitAction): HoldemNoLimitState {
  if (state.phase === "done") return state;

  if (action.type === "deal") {
    if (state.phase !== "idle" && state.phase !== "showdown") return state;
    let s = dealNewHand(state);
    if (s.phase === "done") return s;
    // If CPU acts first pre-flop, run their move(s).
    if (!s.playerToAct) s = applyCpuTurn(s);
    return s;
  }

  // gameplay actions
  if (state.phase === "idle" || state.phase === "showdown") return state;
  if (!state.playerToAct) return state;

  const labels: Record<HoldemActionType, string> = {
    fold: "You fold",
    check: "You check",
    call: `You call`,
    raise: `You raise`,
  };

  // basic legality before applying
  const toCall = state.cpuBet - state.playerBet;
  if (action.type === "check" && toCall > 0) return state;
  if (action.type === "call" && toCall <= 0) return state;
  if (action.type === "raise") {
    // Need at least min raise; allow all-in shorter than min raise as a final action
    const minLegal = Math.min(state.playerStack + state.playerBet, state.cpuBet + Math.max(state.bigBlind, state.lastRaiseSize));
    if (action.amount < minLegal) return state;
  }

  let label = labels[action.type];
  if (action.type === "call") {
    const callAmt = Math.min(state.cpuBet - state.playerBet, state.playerStack);
    label = `You call $${callAmt}`;
  } else if (action.type === "raise") {
    label = `You raise to $${action.amount}`;
  }

  let s = applyAction(state, action, /*isPlayer*/ true, label);
  if (s.phase === "showdown" || s.phase === "done") return s;
  // CPU response if it's now their turn
  if (!s.playerToAct) s = applyCpuTurn(s);
  return s;
}

export function isTerminal(state: HoldemNoLimitState): { score: number } | null {
  if (state.phase === "done") return { score: state.playerStack };
  if (state.phase === "showdown" && (state.playerStack <= 0 || state.cpuStack <= 0)) {
    return { score: state.playerStack };
  }
  return null;
}

// ---------- exposed for UI / tests ----------

export function minRaiseTotal(s: HoldemNoLimitState): number {
  // smallest legal raise-to (total street bet) from the player's perspective.
  // can't exceed all-in
  const maxTotal = s.playerStack + s.playerBet;
  return Math.min(maxTotal, s.cpuBet + Math.max(s.bigBlind, s.lastRaiseSize));
}

export function maxRaiseTotal(s: HoldemNoLimitState): number {
  return s.playerStack + s.playerBet;
}

export function callAmount(s: HoldemNoLimitState): number {
  return Math.max(0, Math.min(s.cpuBet - s.playerBet, s.playerStack));
}
