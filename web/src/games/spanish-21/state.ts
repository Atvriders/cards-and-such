import type { Card } from "../../engines/deck/index.js";
import { SUITS, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Spanish21Settings {
  handsPerSession: number;
  bet: "5" | "10" | "25" | "100";
}

export type S21Phase = "betting" | "player" | "settled";

export interface S21Hand {
  cards: Card[];
  bet: number;
  busted: boolean;
  stood: boolean;
  doubled: boolean;
  surrendered: boolean;
}

export interface Spanish21State {
  settings: Spanish21Settings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: S21Phase;
  shoe: Card[];
  discardPile: Card[];
  playerHand: S21Hand;
  dealerHand: Card[];
  dealerFaceDown: boolean;
  lastResult: string;
}

export type Spanish21Action =
  | { type: "deal" }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" }
  | { type: "surrender" };

/** Build a Spanish deck: standard 52-card deck minus all four 10s (ranks 1-9, J, Q, K only) */
export function newSpanishDeck(copies = 1): Card[] {
  const cards: Card[] = [];
  for (let c = 0; c < copies; c++) {
    for (const s of SUITS) {
      for (let r = 1; r <= 13; r++) {
        if (r === 10) continue; // remove all 10s
        cards.push({ suit: s, rank: r as Card["rank"], id: `${c}-${s}${r}` });
      }
    }
  }
  return cards;
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(
  n: number,
  shoe: Card[],
  discardPile: Card[],
  rng: () => number
): { cards: Card[]; shoe: Card[]; discardPile: Card[] } {
  let currentShoe = shoe;
  let currentDiscard = discardPile;
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (currentShoe.length < 15) {
      const reshuffled = shuffle([...currentShoe, ...currentDiscard], rng);
      const r = deal(reshuffled, 1);
      cards.push(r.drawn[0]!);
      currentShoe = r.remaining;
      currentDiscard = [];
    } else {
      const r = deal(currentShoe, 1);
      cards.push(r.drawn[0]!);
      currentShoe = r.remaining;
    }
  }
  return { cards, shoe: currentShoe, discardPile: currentDiscard };
}

export function handValue(hand: Card[]): { best: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === 1) { aces++; total += 11; }
    else if (c.rank >= 11) total += 10;
    else total += c.rank;
  }
  let soft = aces > 0;
  while (total > 21 && aces > 0) { total -= 10; aces--; soft = false; }
  return { best: total, soft: soft && aces > 0 };
}

/** Spanish 21 bonus: player 21 always wins, special multi-card bonuses */
export function getBonus(hand: Card[]): { multiplier: number; label: string } | null {
  const val = handValue(hand).best;
  if (val !== 21) return null;
  const n = hand.length;
  const ranks = hand.map(c => c.rank === 1 ? 11 : c.rank >= 11 ? 10 : c.rank);

  // 6-7-8 or 7-7-7 suited
  const sorted = [...hand].sort((a,b) => a.rank - b.rank);
  if (n === 3) {
    const isSuited = hand.every(c => c.suit === hand[0]!.suit);
    const r = sorted.map(c => c.rank);
    if (r[0] === 6 && r[1] === 7 && r[2] === 8) {
      return isSuited ? { multiplier: 3, label: "Suited 6-7-8 (3:1)!" } : { multiplier: 2, label: "6-7-8 (2:1)!" };
    }
    if (r[0] === 7 && r[1] === 7 && r[2] === 7) {
      return isSuited ? { multiplier: 3, label: "Suited 7-7-7 (3:1)!" } : { multiplier: 2, label: "7-7-7 (2:1)!" };
    }
  }
  // 5-card 21
  if (n === 5) return { multiplier: 2, label: "5-Card 21 (2:1)!" };
  // 6-card 21
  if (n === 6) return { multiplier: 3, label: "6-Card 21 (3:1)!" };
  // 7+ card 21
  if (n >= 7) return { multiplier: 4, label: "7+ Card 21 (4:1)!" };
  // Regular 21 with 3-4 cards
  return null; // 3-4 card 21 is just even money
}

export function initialState(seed: number, settings: Spanish21Settings): Spanish21State {
  const { rng, nextSeed } = advanceSeed(seed);
  const shoe = shuffle(newSpanishDeck(6), rng);
  const bet = parseInt(settings.bet, 10);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerHand: { cards: [], bet, busted: false, stood: false, doubled: false, surrendered: false },
    dealerHand: [],
    dealerFaceDown: false,
    lastResult: "",
  };
}

function settle(state: Spanish21State): Spanish21State {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  let dealerCards = [...state.dealerHand];
  let shoe = state.shoe;
  let discardPile = state.discardPile;

  // Dealer draws to 17 (hits soft 17)
  let dv = handValue(dealerCards);
  while (dv.best < 17 || (dv.soft && dv.best === 17)) {
    const draw = drawN(1, shoe, discardPile, rng);
    dealerCards = [...dealerCards, draw.cards[0]!];
    shoe = draw.shoe;
    discardPile = draw.discardPile;
    dv = handValue(dealerCards);
  }

  const hand = state.playerHand;
  let bankroll = state.bankroll;
  let result = "";

  if (hand.surrendered) {
    bankroll += Math.floor(hand.bet / 2);
    result = `Surrendered. Recovered $${Math.floor(hand.bet / 2)}.`;
  } else if (hand.busted) {
    result = `Bust! Lost $${hand.bet}.`;
  } else {
    const pv = handValue(hand.cards).best;
    const dv2 = handValue(dealerCards).best;
    const dealerBust = dv2 > 21;

    // Player 21 always beats dealer 21 (the key Spanish 21 rule)
    const bonus = getBonus(hand.cards);
    if (pv === 21 || dealerBust || pv > dv2) {
      const mult = bonus ? bonus.multiplier : 1;
      bankroll += hand.bet + hand.bet * mult;
      result = bonus ? `${bonus.label} Win +$${hand.bet * mult}` : `Win! +$${hand.bet}${dealerBust ? " (dealer bust)" : ""}`;
    } else if (pv < dv2) {
      result = `Dealer ${dv2} beats ${pv}. Lost $${hand.bet}.`;
    } else {
      bankroll += hand.bet;
      result = "Push.";
    }
  }

  const allCards = [...hand.cards, ...dealerCards];
  discardPile = [...discardPile, ...allCards];

  return {
    ...state,
    rngSeed: nextSeed,
    bankroll,
    handsPlayed: state.handsPlayed + 1,
    phase: "settled",
    shoe,
    discardPile,
    dealerHand: dealerCards,
    dealerFaceDown: false,
    lastResult: result,
  };
}

export function reducer(state: Spanish21State, action: Spanish21Action): Spanish21State {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw4 = drawN(4, state.shoe, state.discardPile, rng);
      const [p1, d1, p2, d2] = draw4.cards as [Card, Card, Card, Card];

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - bet,
        phase: "player",
        shoe: draw4.shoe,
        discardPile: draw4.discardPile,
        playerHand: { cards: [p1, p2], bet, busted: false, stood: false, doubled: false, surrendered: false },
        dealerHand: [d1, d2],
        dealerFaceDown: true,
        lastResult: "",
      };
    }

    case "hit": {
      if (state.phase !== "player") return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...state.playerHand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const newHand: S21Hand = { ...state.playerHand, cards: newCards, busted };

      if (busted) {
        return settle({ ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand: newHand });
      }

      // If player has 21, auto-stand and settle
      if (val.best === 21) {
        const stood: S21Hand = { ...newHand, stood: true };
        return settle({ ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand: stood });
      }

      return { ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand: newHand };
    }

    case "stand": {
      if (state.phase !== "player") return state;
      return settle({ ...state, playerHand: { ...state.playerHand, stood: true } });
    }

    case "double": {
      if (state.phase !== "player") return state;
      if (state.playerHand.cards.length !== 2) return state;
      if (state.bankroll < state.playerHand.bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...state.playerHand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const newHand: S21Hand = {
        ...state.playerHand,
        cards: newCards,
        bet: state.playerHand.bet * 2,
        doubled: true,
        busted,
        stood: !busted,
      };

      return settle({
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - state.playerHand.bet,
        shoe: draw.shoe,
        discardPile: draw.discardPile,
        playerHand: newHand,
      });
    }

    case "surrender": {
      if (state.phase !== "player") return state;
      if (state.playerHand.cards.length !== 2) return state;
      const hand: S21Hand = { ...state.playerHand, surrendered: true };
      return settle({ ...state, playerHand: hand });
    }

    default:
      return state;
  }
}

export function isTerminal(state: Spanish21State): { score: number } | null {
  if (state.phase !== "settled" && state.phase !== "betting") return null;
  if (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0) {
    return { score: state.bankroll };
  }
  return null;
}
