import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FiveHundredSettings {
  botBidding: "conservative" | "balanced";
}

export type FiveHundredPhase = "bidding" | "playing" | "done";

// Bid: {level, trump} — trump null = no-trump
export interface Bid {
  level: number; // 6-10
  trump: Suit | "NT";
}

export const VALID_BIDS: Bid[] = [
  { level: 6, trump: "♥" },
  { level: 7, trump: "♥" },
  { level: 8, trump: "♥" },
  { level: 9, trump: "♥" },
  { level: 10, trump: "♥" },
  { level: 6, trump: "NT" },
  { level: 8, trump: "NT" },
  { level: 10, trump: "NT" },
];

export interface FiveHundredState {
  settings: FiveHundredSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // 4 seats
  kitty: readonly Card[];               // 3 extra cards (face down to all)
  bids: readonly (Bid | "pass" | null)[];  // null = not yet bid
  contractBid: Bid | null;             // winning bid
  contractSeat: number | null;
  trumpSuit: Suit | "NT" | null;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: FiveHundredPhase;
  tricksTaken: readonly number[];      // per seat
  tricksPlayed: number;
  teamScore: readonly [number, number]; // team 0 (0&2), team 1 (1&3)
  message: string;
}

export type FiveHundredAction =
  | { type: "bid"; bidIndex: number }   // index into VALID_BIDS or -1 = pass
  | { type: "play"; cardId: string };

// ── 500 deck: standard 52 + Joker = 53 cards ─────────────────────────────────
// Deal 10 to each of 4 players (40), 3-card kitty (43), 10 undealt (ignored).
// This matches the common 4-player implementation.

export function make32Deck(): Card[] {
  // Use full 52-card deck + joker for simplicity in 4-player deal
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
  const cards: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `${s}${r}` });
    }
  }
  // Joker
  cards.push({ suit: "♠", rank: 1, id: "joker" });
  return cards; // 53 cards total
}

export function isJoker(card: Card): boolean {
  return card.id === "joker";
}

// ── Rank ordering within a suit ───────────────────────────────────────────────

function effectiveRank(card: Card, trump: Suit | "NT" | null): number {
  if (isJoker(card)) return 100; // always highest
  if (trump === "NT" || trump === null) return card.rank === 1 ? 14 : card.rank;
  // Standard trick rank: A=14, K=13, Q=12, J=11, 10=10
  return card.rank === 1 ? 14 : card.rank;
}

function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trump: Suit | "NT" | null,
): number {
  const ledSuit = trick[0]!.card.suit;

  let best = trick[0]!;
  for (const e of trick.slice(1)) {
    const card = e.card;
    const bestCard = best.card;
    if (isJoker(card)) { best = e; continue; }
    if (isJoker(bestCard)) continue;

    const cardIsTrump = trump !== "NT" && trump !== null && card.suit === trump;
    const bestIsTrump = trump !== "NT" && trump !== null && bestCard.suit === trump;

    if (cardIsTrump && !bestIsTrump) { best = e; continue; }
    if (!cardIsTrump && bestIsTrump) continue;

    // Same effective group (both trump or both non-trump)
    const cardSuitMatches = card.suit === ledSuit;
    const bestSuitMatches = bestCard.suit === ledSuit;
    if (!cardIsTrump) {
      if (cardSuitMatches && !bestSuitMatches) { best = e; continue; }
      if (!cardSuitMatches && bestSuitMatches) continue;
    }

    const cr = effectiveRank(card, trump);
    const br = effectiveRank(bestCard, trump);
    if (cr > br) best = e;
  }
  return best.seat;
}

export function legalPlays(state: FiveHundredState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];

  const led = trick[0]!.card;
  if (isJoker(led)) return [...hand]; // joker led → no suit requirement

  const trump = state.trumpSuit;
  const ledSuit = led.suit;

  // Joker can always be played
  const suitCards = hand.filter(c => !isJoker(c) && c.suit === ledSuit);
  if (suitCards.length > 0) {
    // Must follow suit; joker can still be played
    const joker = hand.find(isJoker);
    return joker ? [...suitCards, joker] : suitCards;
  }

  // Check trump
  if (trump !== "NT" && trump !== null) {
    const trumpCards = hand.filter(c => !isJoker(c) && c.suit === trump);
    if (trumpCards.length > 0) {
      const joker = hand.find(isJoker);
      return joker ? [...trumpCards, joker] : trumpCards;
    }
  }

  return [...hand];
}

// ── Bot bidding ───────────────────────────────────────────────────────────────

function botBid(hand: readonly Card[], settings: FiveHundredSettings, prevBids: readonly (Bid | "pass" | null)[]): Bid | "pass" {
  // Count high cards
  const highCount = hand.filter(c => !isJoker(c) && (c.rank === 1 || c.rank >= 12)).length;
  const hasJoker = hand.some(isJoker);

  // Conservative: only bid with 3+ high cards
  const threshold = settings.botBidding === "conservative" ? 3 : 2;

  if (highCount + (hasJoker ? 1 : 0) < threshold) return "pass";

  // Find min level needed to overcome existing bids
  const activeBids = prevBids.filter((b): b is Bid => b !== "pass" && b !== null);
  const minLevel = activeBids.length === 0 ? 6 :
    Math.max(...activeBids.map(b => b.level + (b.trump === "NT" ? 0.5 : 0)));

  const level = Math.min(10, Math.max(6, Math.ceil(highCount * 1.2)));
  if (level <= Math.floor(minLevel)) return "pass";

  return { level: Math.min(10, level), trump: "♥" };
}

// ── Bot play ──────────────────────────────────────────────────────────────────

function botPlay(state: FiveHundredState, seat: number, _rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  if (trick.length === 0) {
    // Lead lowest
    return legal.reduce((lo, c) => effectiveRank(c, state.trumpSuit) < effectiveRank(lo, state.trumpSuit) ? c : lo);
  }
  const winner = trickWinner(trick, state.trumpSuit);
  const team = (s: number) => s % 2;
  if (team(winner) === team(seat)) {
    return legal.reduce((lo, c) => effectiveRank(c, state.trumpSuit) < effectiveRank(lo, state.trumpSuit) ? c : lo);
  }
  // Try to win
  const winnerE = trick.find(e => e.seat === winner)!;
  const winnerRank = effectiveRank(winnerE.card, state.trumpSuit);
  const beating = legal.filter(c => effectiveRank(c, state.trumpSuit) > winnerRank);
  if (beating.length > 0) return beating.reduce((lo, c) => effectiveRank(c, state.trumpSuit) < effectiveRank(lo, state.trumpSuit) ? c : lo);
  return legal.reduce((lo, c) => effectiveRank(c, state.trumpSuit) < effectiveRank(lo, state.trumpSuit) ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: FiveHundredState, seat: number, card: Card, _rng: () => number): FiveHundredState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: FiveHundredState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const tricksPlayed = state.tricksPlayed + 1;
    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, tricksPlayed, leadSeat: winner, turn: winner };

    if (tricksPlayed === 10) {
      // Score
      const contractSeat = state.contractSeat!;
      const bid = state.contractBid!;
      const contractTeam = contractSeat % 2 as 0 | 1;
      const contractTricks = newTricksTaken[contractSeat]! +
        newTricksTaken[(contractSeat + 2) % 4]!;
      const bidValue = bid.level * 20;

      const delta0 = contractTeam === 0
        ? (contractTricks >= bid.level ? bidValue : -bidValue)
        : (10 - contractTricks >= bid.level ? 20 : 0); // rough
      const delta1 = contractTeam === 1
        ? (contractTricks >= bid.level ? bidValue : -bidValue)
        : (10 - contractTricks >= bid.level ? 20 : 0);

      const newScore: [number, number] = [
        state.teamScore[0] + delta0,
        state.teamScore[1] + delta1,
      ];
      const msg = contractTricks >= bid.level
        ? `Contract made! ${contractTricks}/${bid.level} tricks. Score: ${newScore[0]} vs ${newScore[1]}`
        : `Contract failed! ${contractTricks}/${bid.level} tricks. Score: ${newScore[0]} vs ${newScore[1]}`;
      s = { ...s, phase: "done", teamScore: newScore, message: msg };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: FiveHundredState, action: FiveHundredAction): FiveHundredState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (state.phase === "bidding") {
    if (action.type !== "bid") return state;
    if (state.turn !== 0) return state;

    // Player bid
    const playerBid: Bid | "pass" = action.bidIndex === -1 ? "pass" : VALID_BIDS[action.bidIndex]!;
    let newBids = state.bids.map((b, i) => i === 0 ? playerBid : b);
    let turn = 1;
    let s: FiveHundredState = { ...state, rngSeed: nextSeed, bids: newBids, turn };

    // Bots bid
    while (s.turn !== 0 && s.bids[s.turn] === null) {
      const botSeat = s.turn;
      const bb = botBid(s.hands[botSeat]!, s.settings, s.bids);
      newBids = s.bids.map((b, i) => i === botSeat ? bb : b);
      s = { ...s, bids: newBids, turn: (botSeat + 1) % 4 };
    }

    // All bids in
    if (s.bids.every(b => b !== null)) {
      // Find winning bid
      let contractBid: Bid | null = null;
      let contractSeat: number | null = null;
      for (let i = 0; i < 4; i++) {
        const b = s.bids[i];
        if (b === "pass" || b === null || b === undefined) continue;
        if (contractBid === null || b.level > contractBid.level) {
          contractBid = b;
          contractSeat = i;
        }
      }

      if (contractBid === null) {
        // Everyone passed — redeal (restart)
        return initialState(nextSeed, state.settings);
      }

      // Winner picks up kitty (auto-managed) — kitty cards added to winner's hand, discard 3 lowest
      const kitty = state.kitty;
      let winnerHand = [...s.hands[contractSeat!]!, ...kitty];
      // Discard 3 lowest-ranked cards
      winnerHand.sort((a, b) => effectiveRank(a, contractBid!.trump === "NT" ? "NT" : contractBid!.trump as Suit) - effectiveRank(b, contractBid!.trump === "NT" ? "NT" : contractBid!.trump as Suit));
      winnerHand = winnerHand.slice(3); // remove 3 lowest

      const trumpSuit: Suit | "NT" | null = contractBid.trump === "NT" ? "NT" : contractBid.trump;

      const updatedHands = s.hands.map((h, i) =>
        i === contractSeat ? winnerHand : h
      );

      s = {
        ...s,
        hands: updatedHands,
        contractBid,
        contractSeat,
        trumpSuit,
        phase: "playing",
        leadSeat: contractSeat!,
        turn: contractSeat!,
        message: `${contractSeat === 0 ? "You" : `Bot ${contractSeat}`} bid ${contractBid.level}${contractBid.trump}`,
      };

      // Auto-play bots until seat 0
      while (s.phase !== "done" && s.turn !== 0) {
        if (s.hands[s.turn]!.length === 0) break;
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

    let s: FiveHundredState = { ...state, rngSeed: nextSeed };
    s = applyCard(s, 0, card, botRng);

    while (s.phase !== "done" && s.turn !== 0) {
      if (s.hands[s.turn]!.length === 0) break;
      const botCard = botPlay(s, s.turn, botRng);
      s = applyCard(s, s.turn, botCard, botRng);
    }

    return s;
  }

  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: FiveHundredSettings): FiveHundredState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(make32Deck(), dealRng);
  // Deal 10 each + 3 kitty
  const hands: Card[][] = [
    deck.slice(0, 10),
    deck.slice(10, 20),
    deck.slice(20, 30),
    deck.slice(30, 40),
  ];
  const kitty = deck.slice(40, 43);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    kitty,
    bids: [null, null, null, null],
    contractBid: null,
    contractSeat: null,
    trumpSuit: null,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    tricksTaken: [0, 0, 0, 0],
    tricksPlayed: 0,
    teamScore: [0, 0],
    message: "Place your bid or Pass. Simplest bids: 6♥, 7♥, 8♥, 9♥, 10♥, 6NT, 8NT, 10NT.",
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: FiveHundredState): { score: number } | null {
  if (state.phase !== "done") return null;
  const score0 = state.teamScore[0];
  const score1 = state.teamScore[1];
  if (score0 > score1) return { score: 100 };
  if (score0 < score1) return { score: 0 };
  return { score: 50 };
}
