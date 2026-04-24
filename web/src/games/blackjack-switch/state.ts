import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BlackjackSwitchSettings {
  handsPerSession: number;
  bet: "5" | "10" | "25" | "100";
  deckCount: "6" | "8";
}

export type BSPhase = "betting" | "player" | "switch-decision" | "dealer" | "settled";

export interface BSHand {
  cards: Card[];
  bet: number;
  busted: boolean;
  stood: boolean;
  doubled: boolean;
}

export interface BlackjackSwitchState {
  settings: BlackjackSwitchSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: BSPhase;
  shoe: Card[];
  discardPile: Card[];
  hand1: BSHand;
  hand2: BSHand;
  activeHandIndex: number; // 0 = hand1, 1 = hand2
  switchOffered: boolean;
  switched: boolean;
  dealerHand: Card[];
  dealerFaceDown: boolean;
  lastResult: string;
}

export type BlackjackSwitchAction =
  | { type: "deal" }
  | { type: "switch" }
  | { type: "no-switch" }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
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

function emptyHand(bet: number): BSHand {
  return { cards: [], bet, busted: false, stood: false, doubled: false };
}

export function initialState(seed: number, settings: BlackjackSwitchSettings): BlackjackSwitchState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deckCount = parseInt(settings.deckCount, 10);
  const shoe = shuffle(newDeck(deckCount), rng);
  const bet = parseInt(settings.bet, 10);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    hand1: emptyHand(bet),
    hand2: emptyHand(bet),
    activeHandIndex: 0,
    switchOffered: false,
    switched: false,
    dealerHand: [],
    dealerFaceDown: false,
    lastResult: "",
  };
}

function settleHands(state: BlackjackSwitchState): BlackjackSwitchState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  let dealerCards = [...state.dealerHand];
  let shoe = state.shoe;
  let discardPile = state.discardPile;

  // Dealer draws to 17+
  let dv = handValue(dealerCards);
  while (dv.best < 17) {
    const r = drawN(1, shoe, discardPile, rng);
    dealerCards = [...dealerCards, r.cards[0]!];
    shoe = r.shoe;
    discardPile = r.discardPile;
    dv = handValue(dealerCards);
  }

  // In Blackjack Switch, dealer pushes on 22 (doesn't bust)
  const dealerVal = handValue(dealerCards).best;
  const dealerBust = dealerVal > 22;
  const dealerPush22 = dealerVal === 22; // dealer 22 = push against all non-busted hands

  let bankroll = state.bankroll;
  const parts: string[] = [];

  const hands = [state.hand1, state.hand2];
  for (let i = 0; i < hands.length; i++) {
    const hand = hands[i]!;
    const pv = handValue(hand.cards).best;
    const label = `Hand ${i + 1}`;
    if (hand.busted) {
      parts.push(`${label}: Bust`);
    } else if (dealerBust) {
      bankroll += hand.bet * 2;
      parts.push(`${label}: Win +$${hand.bet}`);
    } else if (dealerPush22) {
      bankroll += hand.bet;
      parts.push(`${label}: Push (dealer 22)`);
    } else if (pv > dealerVal) {
      bankroll += hand.bet * 2;
      parts.push(`${label}: Win +$${hand.bet}`);
    } else if (pv < dealerVal) {
      parts.push(`${label}: Lose -$${hand.bet}`);
    } else {
      bankroll += hand.bet;
      parts.push(`${label}: Push`);
    }
  }

  const allCards = [...state.hand1.cards, ...state.hand2.cards, ...dealerCards];
  discardPile = [...discardPile, ...allCards];

  return {
    ...state,
    rngSeed: nextSeed,
    bankroll,
    handsPlayed: state.handsPlayed + 1,
    phase: "settled",
    shoe,
    discardPile,
    hand1: { ...state.hand1 },
    hand2: { ...state.hand2 },
    dealerHand: dealerCards,
    dealerFaceDown: false,
    lastResult: parts.join(" | "),
  };
}

function advanceHand(state: BlackjackSwitchState): BlackjackSwitchState {
  if (state.activeHandIndex === 0) {
    return { ...state, activeHandIndex: 1 };
  }
  return settleHands(state);
}

export function reducer(state: BlackjackSwitchState, action: BlackjackSwitchAction): BlackjackSwitchState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      const bet = parseInt(state.settings.bet, 10);
      const totalBet = bet * 2;
      if (state.bankroll < totalBet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Deal: h1c1, h2c1, dealer1, h1c2, h2c2, dealer2
      const draw6 = drawN(6, state.shoe, state.discardPile, rng);
      const [h1c1, h2c1, d1, h1c2, h2c2, d2] = draw6.cards as [Card, Card, Card, Card, Card, Card];

      const hand1: BSHand = { cards: [h1c1, h1c2], bet, busted: false, stood: false, doubled: false };
      const hand2: BSHand = { cards: [h2c1, h2c2], bet, busted: false, stood: false, doubled: false };

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - totalBet,
        phase: "switch-decision",
        shoe: draw6.shoe,
        discardPile: draw6.discardPile,
        hand1,
        hand2,
        activeHandIndex: 0,
        switchOffered: true,
        switched: false,
        dealerHand: [d1, d2],
        dealerFaceDown: true,
        lastResult: "",
      };
    }

    case "switch": {
      if (state.phase !== "switch-decision") return state;
      // Swap the second cards of each hand
      const h1 = state.hand1;
      const h2 = state.hand2;
      const newH1: BSHand = { ...h1, cards: [h1.cards[0]!, h2.cards[1]!] };
      const newH2: BSHand = { ...h2, cards: [h2.cards[0]!, h1.cards[1]!] };
      return { ...state, phase: "player", hand1: newH1, hand2: newH2, switched: true, activeHandIndex: 0 };
    }

    case "no-switch": {
      if (state.phase !== "switch-decision") return state;
      return { ...state, phase: "player", activeHandIndex: 0 };
    }

    case "hit": {
      if (state.phase !== "player") return state;
      const isHand1 = state.activeHandIndex === 0;
      const hand = isHand1 ? state.hand1 : state.hand2;
      if (hand.stood || hand.busted) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...hand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const newHand: BSHand = { ...hand, cards: newCards, busted };

      const newState: BlackjackSwitchState = {
        ...state,
        rngSeed: nextSeed,
        shoe: draw.shoe,
        discardPile: draw.discardPile,
        hand1: isHand1 ? newHand : state.hand1,
        hand2: isHand1 ? state.hand2 : newHand,
      };

      if (busted) return advanceHand(newState);
      return newState;
    }

    case "stand": {
      if (state.phase !== "player") return state;
      const isHand1 = state.activeHandIndex === 0;
      const hand = isHand1 ? state.hand1 : state.hand2;
      const newHand: BSHand = { ...hand, stood: true };
      return advanceHand({
        ...state,
        hand1: isHand1 ? newHand : state.hand1,
        hand2: isHand1 ? state.hand2 : newHand,
      });
    }

    case "double": {
      if (state.phase !== "player") return state;
      const isHand1 = state.activeHandIndex === 0;
      const hand = isHand1 ? state.hand1 : state.hand2;
      if (hand.cards.length !== 2) return state;
      if (state.bankroll < hand.bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...hand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const newHand: BSHand = { ...hand, cards: newCards, bet: hand.bet * 2, doubled: true, busted, stood: !busted };

      const newState: BlackjackSwitchState = {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - hand.bet,
        shoe: draw.shoe,
        discardPile: draw.discardPile,
        hand1: isHand1 ? newHand : state.hand1,
        hand2: isHand1 ? state.hand2 : newHand,
      };

      return advanceHand(newState);
    }

    default:
      return state;
  }
}

export function isTerminal(state: BlackjackSwitchState): { score: number } | null {
  if (state.phase !== "settled" && state.phase !== "betting") return null;
  if (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0) {
    return { score: state.bankroll };
  }
  return null;
}
