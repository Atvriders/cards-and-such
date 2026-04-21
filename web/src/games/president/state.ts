import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PresidentSettings {
  dummy: "off";
}

export type PresidentPhase = "playing" | "done";

export type Title = "President" | "Vice" | "Scum" | "Double Scum";

export interface PresidentState {
  settings: PresidentSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  // current round: last played cards (set of same rank)
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number; // consecutive passes
  finishOrder: readonly number[]; // seats that have emptied hands in order
  phase: PresidentPhase;
  titles: readonly Title[] | null;
  rngSeed: number;
}

export type PresidentAction =
  | { type: "play"; cardIds: string[] }
  | { type: "pass" };

// ── helpers ────────────────────────────────────────────────────────────────────

const SEATS = 4;

function rankVal(r: Rank): number {
  // 3 is lowest, 2 is highest (standard President ranking)
  // 3=3, 4=4,..., 10=10, J=11, Q=12, K=13, A=14, 2=15
  if (r === 2) return 15;
  if (r === 1) return 14; // Ace
  return r;
}

export function isLegalPlay(
  cards: readonly Card[],
  lastPlay: readonly Card[] | null,
): boolean {
  if (cards.length === 0) return false;
  // All selected cards must be same rank
  const r = cards[0]!.rank;
  if (!cards.every(c => c.rank === r)) return false;

  if (lastPlay === null || lastPlay.length === 0) {
    // First play of the round — any set of same rank is fine
    return true;
  }

  // Must match count of last play
  if (cards.length !== lastPlay.length) return false;

  // Must be higher rank
  const lastRank = lastPlay[0]!.rank;
  return rankVal(r) > rankVal(lastRank);
}

function botPlay(
  hand: readonly Card[],
  lastPlay: readonly Card[] | null,
  _rng: () => number,
): string[] | null {
  // Build groups by rank
  const groups = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = groups.get(c.rank) ?? [];
    arr.push(c);
    groups.set(c.rank, arr);
  }

  const count = lastPlay?.length ?? 1;

  // Find all groups of the right size with high enough rank
  const candidates: Card[][] = [];
  for (const [, cards] of groups) {
    if (cards.length >= count) {
      const subset = cards.slice(0, count);
      if (isLegalPlay(subset, lastPlay)) {
        candidates.push(subset);
      }
    }
  }

  if (candidates.length === 0) return null; // must pass

  // Play lowest legal set
  candidates.sort((a, b) => rankVal(a[0]!.rank) - rankVal(b[0]!.rank));
  return candidates[0]!.map(c => c.id);
}

function applyPlay(state: PresidentState, seat: number, cardIds: string[]): PresidentState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)!);
  if (played.some(c => !c)) return state; // invalid

  if (!isLegalPlay(played, state.lastPlay)) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);

  let finishOrder = [...state.finishOrder];
  if (newHand.length === 0 && !finishOrder.includes(seat)) {
    finishOrder = [...finishOrder, seat];
  }

  // Check if game is done (only 1 player left with cards or 3 have finished)
  const remaining = newHands.filter((h, i) => h.length > 0 && !finishOrder.includes(i));
  if (finishOrder.length >= 3) {
    // Last player is the loser
    const lastSeat = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    const finalFinish = [...finishOrder, lastSeat];
    const titleMap: Title[] = ["President", "Vice", "Scum", "Double Scum"];
    const titles: Title[] = [0, 1, 2, 3].map(s => {
      const pos = finalFinish.indexOf(s);
      return titleMap[pos]!;
    });
    return {
      ...state,
      hands: newHands,
      lastPlay: played,
      lastPlaySeat: seat,
      passCount: 0,
      finishOrder: finalFinish,
      phase: "done",
      titles,
    };
  }

  // Advance turn, skip empty-handed players
  let nextTurn = (seat + 1) % SEATS;
  let tries = 0;
  while ((newHands[nextTurn]!.length === 0 || finishOrder.includes(nextTurn)) && tries < SEATS) {
    nextTurn = (nextTurn + 1) % SEATS;
    tries++;
  }

  return {
    ...state,
    hands: newHands,
    lastPlay: played,
    lastPlaySeat: seat,
    passCount: 0,
    turn: nextTurn,
    finishOrder,
  };
}

function applyPass(state: PresidentState, seat: number): PresidentState {
  const activePlayers = [0, 1, 2, 3].filter(
    s => state.hands[s]!.length > 0 && !state.finishOrder.includes(s)
  );

  const newPassCount = state.passCount + 1;
  const passesNeeded = activePlayers.length - 1;

  // If everyone else passed, the last player who played starts fresh
  if (newPassCount >= passesNeeded) {
    // New round: last play is cleared, last player who played leads
    const nextLead = state.lastPlaySeat ?? activePlayers[0]!;
    return {
      ...state,
      passCount: 0,
      lastPlay: null,
      lastPlaySeat: null,
      turn: nextLead,
    };
  }

  let nextTurn = (seat + 1) % SEATS;
  let tries = 0;
  while (
    (state.hands[nextTurn]!.length === 0 || state.finishOrder.includes(nextTurn)) &&
    tries < SEATS
  ) {
    nextTurn = (nextTurn + 1) % SEATS;
    tries++;
  }

  return { ...state, passCount: newPassCount, turn: nextTurn };
}

function runBots(state: PresidentState, rng: () => number): PresidentState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 200) {
    safety++;
    const seat = s.turn;
    const hand = s.hands[seat]!;
    if (hand.length === 0 || s.finishOrder.includes(seat)) {
      s = applyPass(s, seat);
      continue;
    }
    const play = botPlay(hand, s.lastPlay, rng);
    if (play) {
      const next = applyPlay(s, seat, play);
      if (next === s) {
        s = applyPass(s, seat);
      } else {
        s = next;
      }
    } else {
      s = applyPass(s, seat);
    }
  }
  return s;
}

// ── initialState ───────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: PresidentSettings): PresidentState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  // Deal 13 each
  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];

  // Lowest card (rank 3) leads; find who has 3♣ first
  let leadSeat = 0;
  for (let s = 0; s < 4; s++) {
    if (hands[s]!.some(c => c.rank === 3 && c.suit === "♣")) {
      leadSeat = s;
      break;
    }
  }

  let state: PresidentState = {
    settings,
    hands,
    turn: leadSeat,
    lastPlay: null,
    lastPlaySeat: null,
    passCount: 0,
    finishOrder: [],
    phase: "playing",
    titles: null,
    rngSeed: nextSeed,
  };

  // Run bots if they start
  if (leadSeat !== 0) {
    state = runBots(state, mulberry32(nextSeed));
  }

  return state;
}

// ── reducer ────────────────────────────────────────────────────────────────────

export function reducer(state: PresidentState, action: PresidentAction): PresidentState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let s: PresidentState = { ...state, rngSeed: nextSeed };

  if (action.type === "play") {
    const played = applyPlay(s, 0, action.cardIds);
    if (played === s) return state; // invalid, no mutation
    s = played;
  } else if (action.type === "pass") {
    s = applyPass(s, 0);
  } else {
    return state;
  }

  if (s.phase === "done") return s;
  return runBots(s, mulberry32(nextSeed));
}

// ── isTerminal ─────────────────────────────────────────────────────────────────

const TITLE_SCORES: Record<Title, number> = {
  President: 100,
  Vice: 60,
  Scum: 20,
  "Double Scum": 0,
};

export function isTerminal(state: PresidentState): { score: number } | null {
  if (state.phase !== "done" || !state.titles) return null;
  const myTitle = state.titles[0]!;
  return { score: TITLE_SCORES[myTitle] };
}

export { rankVal };
