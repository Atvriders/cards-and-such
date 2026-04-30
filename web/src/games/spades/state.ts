import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpadesSettings {
  botBidding: "conservative" | "balanced" | "aggressive";
}

export type SpadesPhase = "bidding" | "playing" | "done";

export interface SpadesState {
  settings: SpadesSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 4 seats
  bids: readonly (number | null)[];      // 4 bids; null = not yet bid
  tricks: readonly number[];             // tricks won per seat this hand
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: SpadesPhase;
  teamScore: readonly [number, number];  // team 0 (seats 0&2), team 1 (seats 1&3)
  teamBags: readonly [number, number];
  nilBidders: readonly boolean[];        // which seats bid nil
  spadesBroken: boolean;
  message: string;
}

export type SpadesAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

// ── Helpers ─────────────────────────────────────────────────────────────────

function teamOf(seat: number): 0 | 1 {
  return (seat % 2 === 0) ? 0 : 1;
}

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const led = ledSuit(trick)!;
  const spades = trick.filter(e => e.card.suit === "♠");
  if (spades.length > 0) {
    return spades.reduce((best, cur) => cur.card.rank > best.card.rank ? cur : best).seat;
  }
  return trick.filter(e => e.card.suit === led)
    .reduce((best, cur) => cur.card.rank > best.card.rank ? cur : best).seat;
}

export function legalPlays(state: SpadesState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;

  if (trick.length === 0) {
    // Leading: can't lead spades unless broken or hand is only spades
    const nonSpades = hand.filter(c => c.suit !== "♠");
    if (!state.spadesBroken && nonSpades.length > 0) return nonSpades;
    return [...hand];
  }

  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  if (suitCards.length > 0) return suitCards;
  return [...hand];
}

// ── Bot bidding ──────────────────────────────────────────────────────────────

function botBid(hand: readonly Card[], setting: SpadesSettings["botBidding"], rng: () => number): number {
  // Count spades + high cards
  const spades = hand.filter(c => c.suit === "♠").length;
  const highCards = hand.filter(c => c.rank >= 11).length;
  const base = Math.round(spades * 0.8 + highCards * 0.3);

  let bid = base;
  if (setting === "conservative") bid = Math.max(1, base - 1);
  if (setting === "aggressive") bid = base + 1;
  // Add small randomness
  bid = Math.max(1, Math.min(13, bid + (rng() < 0.3 ? 1 : 0)));
  return bid;
}

// ── Bot play ─────────────────────────────────────────────────────────────────

function botPlay(state: SpadesState, seat: number, rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 0) return state.hands[seat]![0]!; // safety: empty legal (shouldn't happen)
  if (legal.length === 1) return legal[0]!;

  const trick = state.currentTrick;
  const nilBid = state.nilBidders[seat];

  if (trick.length === 0) {
    // Leading: play lowest non-spade if possible
    const nonSpades = legal.filter(c => c.suit !== "♠");
    const pool = nonSpades.length > 0 ? nonSpades : legal;
    return pool.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }

  const led = ledSuit(trick)!;
  const canFollow = legal.some(c => c.suit === led);

  if (canFollow) {
    const followCards = legal.filter(c => c.suit === led);
    const currentWinner = trickWinner(trick);
    const currentWinnerRank = trick.find(e => e.seat === currentWinner)!.card.rank;

    if (nilBid) {
      // Nil bidder: try to play low (avoid winning)
      const below = followCards.filter(c => c.rank < currentWinnerRank);
      return below.length > 0
        ? below.reduce((lo, c) => c.rank < lo.rank ? c : lo)
        : followCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    }

    // Normal: try to win if on a non-winning team
    const above = followCards.filter(c => c.rank > currentWinnerRank);
    if (above.length > 0) return above.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    return followCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }

  // Can't follow suit — throw off
  if (nilBid) {
    // Throw low spade if possible
    const spades = legal.filter(c => c.suit === "♠");
    if (spades.length > 0) return spades.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  // Play a spade to try to win
  const spades = legal.filter(c => c.suit === "♠");
  if (spades.length > 0) return spades.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  return legal[Math.floor(rng() * legal.length)]!;
}

// ── Score a completed hand ────────────────────────────────────────────────────

function scoreHand(
  tricks: readonly number[],
  bids: readonly (number | null)[],
  nilBidders: readonly boolean[],
  teamBags: readonly [number, number],
): {
  scoreDelta: [number, number];
  newBags: [number, number];
} {
  const scoreDelta: [number, number] = [0, 0];
  const newBags: [number, number] = [teamBags[0], teamBags[1]];

  // Nil scoring first
  for (let seat = 0; seat < 4; seat++) {
    if (nilBidders[seat]) {
      const team = teamOf(seat);
      if (tricks[seat] === 0) {
        scoreDelta[team] += 100;
      } else {
        scoreDelta[team] -= 100;
      }
    }
  }

  // Team bidding (excluding nil bidders)
  for (const team of [0, 1] as const) {
    const seats = team === 0 ? [0, 2] : [1, 3];
    const teamBid = seats.reduce((s, seat) => {
      return s + (nilBidders[seat] ? 0 : (bids[seat] ?? 0));
    }, 0);
    const teamTricks = seats.reduce((s, seat) => s + (nilBidders[seat] ? 0 : tricks[seat]!), 0);

    if (teamTricks >= teamBid) {
      const bags = teamTricks - teamBid;
      scoreDelta[team] += teamBid * 10 + bags;
      newBags[team] = teamBags[team] + bags;
      if (newBags[team] >= 10) {
        scoreDelta[team] -= 100;
        newBags[team] -= 10;
      }
    } else {
      scoreDelta[team] -= teamBid * 10;
    }
  }

  return { scoreDelta, newBags };
}

// ── applyCard ────────────────────────────────────────────────────────────────

function applyCard(state: SpadesState, seat: number, card: Card, rng: () => number): SpadesState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];

  const justBroken = state.spadesBroken || card.suit === "♠";
  let s: SpadesState = { ...state, hands: newHands, currentTrick: newTrick, spadesBroken: justBroken };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);

    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    const totalTricks = newTricks.reduce((a, b) => a + b, 0);
    if (totalTricks === 13) {
      // Hand over
      const bids = state.bids;
      const nilBidders = state.nilBidders;
      const { scoreDelta, newBags } = scoreHand(newTricks, bids, nilBidders, state.teamBags);
      const newTeamScore: [number, number] = [
        state.teamScore[0] + scoreDelta[0],
        state.teamScore[1] + scoreDelta[1],
      ];
      const msg = `Hand over! You+Bot2: ${newTeamScore[0]} pts, Bot1+Bot3: ${newTeamScore[1]} pts`;
      s = { ...s, teamScore: newTeamScore, teamBags: newBags, phase: "done", message: msg };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: SpadesState, action: SpadesAction): SpadesState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (state.phase === "bidding") {
    if (action.type !== "bid") return state;
    if (state.turn !== 0) return state;

    // Apply player bid
    const newBids = state.bids.map((b, i) => i === 0 ? action.amount : b);
    const newNil = state.nilBidders.map((n, i) => i === 0 ? action.amount === 0 : n);
    let s: SpadesState = { ...state, rngSeed: nextSeed, bids: newBids, nilBidders: newNil, turn: 1 };

    // Bots bid
    while (s.turn !== 0 && s.bids[s.turn] === null) {
      const botSeat = s.turn;
      const bid = botBid(s.hands[botSeat]!, s.settings.botBidding, botRng);
      const updatedBids = s.bids.map((b, i) => i === botSeat ? bid : b);
      const updatedNil = s.nilBidders.map((n, i) => i === botSeat ? bid === 0 : n);
      s = { ...s, bids: updatedBids, nilBidders: updatedNil, turn: (botSeat + 1) % 4 };
    }

    // All bids in — start playing
    if (s.bids.every(b => b !== null)) {
      const bidsStr = s.bids.map((b, i) => `Seat${i}:${b}`).join(" ");
      s = { ...s, phase: "playing", turn: s.leadSeat, message: `Bidding done: ${bidsStr}` };
      // Auto-play bots until seat 0's turn
      while (!["done"].includes(s.phase) && s.turn !== 0) {
        const botCard = botPlay(s, s.turn, botRng);
        s = applyCard(s, s.turn, botCard, botRng);
      }
    }

    return s;
  }

  if (state.phase === "playing") {
    if (action.type !== "play") return state;
    if (state.turn !== 0) return state;

    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state, 0);
    if (!legal.some(c => c.id === card.id)) return state;

    let s: SpadesState = { ...state, rngSeed: nextSeed };
    s = applyCard(s, 0, card, botRng);

    while (s.phase !== "done" && s.turn !== 0) {
      if (s.hands[s.turn]!.length === 0) break; // safety for test states with empty bot hands
      const botCard = botPlay(s, s.turn, botRng);
      s = applyCard(s, s.turn, botCard, botRng);
    }

    return s;
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: SpadesSettings): SpadesState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    bids: [null, null, null, null],
    tricks: [0, 0, 0, 0],
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    teamScore: [0, 0],
    teamBags: [0, 0],
    nilBidders: [false, false, false, false],
    spadesBroken: false,
    message: "Enter your bid (0 = Nil). Spades are always trump.",
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: SpadesState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerTeamScore = state.teamScore[0];
  const botTeamScore = state.teamScore[1];
  const diff = playerTeamScore - botTeamScore;
  return { score: Math.max(0, Math.min(100, 50 + diff)) };
}
