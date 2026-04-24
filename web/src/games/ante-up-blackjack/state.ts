import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AnteUpSettings {
  handsPerSession: number;
  mainBet: "10" | "25" | "50";
}

export type AnteUpPhase = "betting" | "player" | "settled";

export interface AnteUpHand {
  cards: Card[];
  mainBet: number;
  anteBet: number;
  busted: boolean;
  stood: boolean;
  doubled: boolean;
}

export interface AnteUpState {
  settings: AnteUpSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: AnteUpPhase;
  shoe: Card[];
  discardPile: Card[];
  playerHand: AnteUpHand;
  dealerHand: Card[];
  dealerFaceDown: boolean;
  lastResult: string;
}

export type AnteUpAction =
  | { type: "deal" }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" };

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

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).best === 21;
}

/** Ante Up bonus: 21 pays bonus on the mandatory ante bet */
export function anteBonus(hand: Card[], anteBet: number): { payout: number; label: string } | null {
  if (!isBlackjack(hand) && handValue(hand).best !== 21) return null;
  if (isBlackjack(hand)) return { payout: anteBet * 2, label: "Blackjack Ante Bonus (2:1)!" };
  if (hand.length === 3) return { payout: anteBet, label: "Three-card 21 Ante Bonus (1:1)!" };
  return null;
}

function settle(state: AnteUpState): AnteUpState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  let dealerCards = [...state.dealerHand];
  let shoe = state.shoe;
  let discardPile = state.discardPile;

  let dv = handValue(dealerCards);
  while (dv.best < 17) {
    const draw = drawN(1, shoe, discardPile, rng);
    dealerCards = [...dealerCards, draw.cards[0]!];
    shoe = draw.shoe;
    discardPile = draw.discardPile;
    dv = handValue(dealerCards);
  }

  const hand = state.playerHand;
  let bankroll = state.bankroll;
  const parts: string[] = [];

  if (hand.busted) {
    parts.push(`Bust! Lost $${hand.mainBet + hand.anteBet}.`);
  } else {
    const pv = handValue(hand.cards).best;
    const dv2 = dv.best;
    const dealerBust = dv2 > 21;
    const playerBJ = isBlackjack(hand.cards);
    const dealerBJ = isBlackjack(dealerCards.slice(0, 2));

    // Main bet resolution
    if (playerBJ && dealerBJ) {
      bankroll += hand.mainBet; // push
      parts.push("BJ vs BJ — Push main bet");
    } else if (playerBJ) {
      bankroll += hand.mainBet + Math.floor(hand.mainBet * 1.5);
      parts.push(`Blackjack! Main bet +$${Math.floor(hand.mainBet * 1.5)}`);
    } else if (dealerBJ) {
      parts.push(`Dealer BJ. Lost main $${hand.mainBet}`);
    } else if (dealerBust || pv > dv2) {
      bankroll += hand.mainBet * 2;
      parts.push(`Win main +$${hand.mainBet}`);
    } else if (pv < dv2) {
      parts.push(`Dealer wins. Lost main $${hand.mainBet}`);
    } else {
      bankroll += hand.mainBet;
      parts.push("Push main");
    }

    // Ante bonus (independent of main bet outcome)
    const bonus = anteBonus(hand.cards, hand.anteBet);
    if (bonus) {
      bankroll += hand.anteBet + bonus.payout;
      parts.push(bonus.label);
    } else {
      // Ante lost if no qualifying 21
      parts.push(`Ante lost $${hand.anteBet}`);
    }
  }

  const allCards = [...hand.cards, ...dealerCards];
  discardPile = [...discardPile, ...allCards];

  return {
    ...state,
    rngSeed: nextSeed,
    bankroll: Math.max(0, bankroll),
    handsPlayed: state.handsPlayed + 1,
    phase: "settled",
    shoe,
    discardPile,
    dealerHand: dealerCards,
    dealerFaceDown: false,
    lastResult: parts.join(" | "),
  };
}

export function initialState(seed: number, settings: AnteUpSettings): AnteUpState {
  const { rng, nextSeed } = advanceSeed(seed);
  const shoe = shuffle(newDeck(6), rng);
  const mainBet = parseInt(settings.mainBet, 10);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerHand: { cards: [], mainBet, anteBet: Math.ceil(mainBet * 0.2), busted: false, stood: false, doubled: false },
    dealerHand: [],
    dealerFaceDown: false,
    lastResult: "",
  };
}

export function reducer(state: AnteUpState, action: AnteUpAction): AnteUpState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      const mainBet = parseInt(state.settings.mainBet, 10);
      const anteBet = Math.ceil(mainBet * 0.2);
      const totalBet = mainBet + anteBet;
      if (state.bankroll < totalBet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw4 = drawN(4, state.shoe, state.discardPile, rng);
      const [p1, d1, p2, d2] = draw4.cards as [Card, Card, Card, Card];

      const playerHand: AnteUpHand = {
        cards: [p1, p2],
        mainBet,
        anteBet,
        busted: false,
        stood: false,
        doubled: false,
      };

      const newState: AnteUpState = {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - totalBet,
        phase: "player",
        shoe: draw4.shoe,
        discardPile: draw4.discardPile,
        playerHand,
        dealerHand: [d1, d2],
        dealerFaceDown: true,
        lastResult: "",
      };

      // Immediate BJ settle
      if (isBlackjack([p1, p2]) || isBlackjack([d1, d2])) {
        return settle(newState);
      }
      return newState;
    }

    case "hit": {
      if (state.phase !== "player") return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...state.playerHand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const playerHand: AnteUpHand = { ...state.playerHand, cards: newCards, busted };

      if (busted) {
        return settle({ ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand });
      }
      // Auto-stand on 21
      if (val.best === 21) {
        return settle({ ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand: { ...playerHand, stood: true } });
      }
      return { ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand };
    }

    case "stand": {
      if (state.phase !== "player") return state;
      return settle({ ...state, playerHand: { ...state.playerHand, stood: true } });
    }

    case "double": {
      if (state.phase !== "player") return state;
      if (state.playerHand.cards.length !== 2) return state;
      if (state.bankroll < state.playerHand.mainBet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...state.playerHand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const playerHand: AnteUpHand = {
        ...state.playerHand,
        cards: newCards,
        mainBet: state.playerHand.mainBet * 2,
        doubled: true,
        busted,
        stood: !busted,
      };

      return settle({
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - state.playerHand.mainBet,
        shoe: draw.shoe,
        discardPile: draw.discardPile,
        playerHand,
      });
    }

    default:
      return state;
  }
}

export function isTerminal(state: AnteUpState): { score: number } | null {
  if (state.phase !== "settled" && state.phase !== "betting") return null;
  if (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0) {
    return { score: state.bankroll };
  }
  return null;
}
