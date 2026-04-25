// Napoleon (Nap) – trick-taking bidding game, 5 cards, 2-5 players (4 here)
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NapoleonSettings {
  botDifficulty: "easy" | "hard";
}

export type NapPhase = "bidding" | "playing" | "done";

export interface NapoleonState {
  settings: NapoleonSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit | null;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: NapPhase;
  bid: number;            // 2-5 (Napoleon's declared number of tricks)
  declarer: number;       // seat that won the auction
  tricks: readonly number[];
  score: readonly [number, number]; // [player pts, bot pts]
  message: string;
}

export type NapoleonAction =
  | { type: "bid"; amount: number }  // 0 = pass, 2-5 = bid
  | { type: "play"; cardId: string };

const HAND_SIZE = 5;

function rankOrder(rank: Card["rank"]): number {
  return rank === 1 ? 14 : rank;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: NapoleonState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  return followers.length > 0 ? followers : hand;
}

function botBid(hand: readonly Card[]): number {
  let strong = 0;
  for (const c of hand) {
    if (c.rank === 1 || c.rank >= 12) strong++;
  }
  if (strong >= 4) return 4;
  if (strong >= 3) return 3;
  return 0; // pass
}

function botPlay(state: NapoleonState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trump = state.trumpSuit!;
  const trick = state.currentTrick;
  if (trick.length === 0) {
    // Lead trump if declarer, else lowest
    if (seat === state.declarer) {
      const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
      if (trumpCards.length > 0) return trumpCards[0]!;
    }
    return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: NapoleonState, seat: number, card: Card): NapoleonState {
  const trump = state.trumpSuit!;
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: NapoleonState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, trump);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const declarerTricks = newTricks[state.declarer]!;
      const made = declarerTricks >= state.bid;
      const pts = made ? state.bid : -state.bid;
      const playerPts = state.declarer === 0 ? pts : (declarerTricks >= state.bid ? 0 : 1);
      s = {
        ...s,
        score: [state.score[0] + (state.declarer === 0 ? pts : (made ? 0 : 1)),
                state.score[1] + (state.declarer !== 0 ? pts : 0)],
        phase: "done",
        message: `${state.declarer === 0 ? "You" : `Bot ${state.declarer}`} bid ${state.bid}, took ${declarerTricks} — ${made ? "Made it!" : "Set!"}`,
      };
      void playerPts;
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: NapoleonState, action: NapoleonAction): NapoleonState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "bidding" && action.type === "bid") {
    if (state.turn !== 0) return state;
    const amount = action.amount;
    if (amount !== 0 && (amount < 2 || amount > 5)) return state;

    // Collect bot bids
    const botBids = [1, 2, 3].map(i => botBid(state.hands[i]!));
    const allBids = [amount, ...botBids];
    const maxBid = Math.max(...allBids);

    if (maxBid === 0) {
      // Everyone passed — redeal (just go to done)
      return { ...state, rngSeed: nextSeed, phase: "done", message: "All passed — no game." };
    }

    const declarerIdx = allBids.indexOf(maxBid);
    const declarerTrump = state.hands[declarerIdx]!.reduce(
      (best, c) => rankOrder(c.rank) > rankOrder(best.rank) ? c : best
    ).suit;

    return {
      ...state,
      rngSeed: nextSeed,
      bid: maxBid,
      declarer: declarerIdx,
      trumpSuit: declarerTrump,
      phase: "playing",
      turn: declarerIdx,
      leadSeat: declarerIdx,
      message: `${declarerIdx === 0 ? "You" : `Bot ${declarerIdx}`} wins auction with ${maxBid}. Trump: ${declarerTrump}`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: NapoleonState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: NapoleonSettings): NapoleonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, HAND_SIZE),
    deck.slice(HAND_SIZE, HAND_SIZE * 2),
    deck.slice(HAND_SIZE * 2, HAND_SIZE * 3),
    deck.slice(HAND_SIZE * 3, HAND_SIZE * 4),
  ];
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit: null,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    bid: 0,
    declarer: 0,
    tricks: [0, 0, 0, 0],
    score: [0, 0],
    message: "Bid how many tricks you'll take (2-5), or 0 to pass.",
  };
}

export function isTerminal(state: NapoleonState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 5)) };
}
