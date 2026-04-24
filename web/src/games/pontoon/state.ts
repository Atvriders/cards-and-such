import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PontoonSettings {
  handsPerSession: number;
  bet: "5" | "10" | "25" | "100";
}

export type PontoonPhase = "betting" | "player" | "settled";

export interface PontoonHand {
  cards: Card[];
  bet: number;
  busted: boolean;
  twisted: boolean; // "twist" = hit; stood
  doubled: boolean;
  bought: boolean; // "buy" = double any time
}

export interface PontoonState {
  settings: PontoonSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: PontoonPhase;
  shoe: Card[];
  discardPile: Card[];
  playerHand: PontoonHand;
  dealerHand: Card[];
  lastResult: string;
}

export type PontoonAction =
  | { type: "deal" }
  | { type: "twist" }   // hit
  | { type: "stick" }   // stand (only allowed at 15+)
  | { type: "buy" }     // double at any time (before 5th card)
  | { type: "split" };  // split pairs (simplified: only once)

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

/** Pontoon: Ace + ten-value = "Pontoon" (best possible hand, pays 2:1) */
export function isPontoon(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return handValue(cards).best === 21;
}

/** Five Card Trick: 5 cards totaling <= 21 (second best, beats everything except pontoon) */
export function isFiveCardTrick(cards: Card[]): boolean {
  return cards.length === 5 && handValue(cards).best <= 21;
}

function settle(state: PontoonState): PontoonState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  let dealerCards = [...state.dealerHand];
  let shoe = state.shoe;
  let discardPile = state.discardPile;

  // Dealer draws until >= 17 (or all 5 cards, or bust)
  let dv = handValue(dealerCards);
  while (dv.best < 17 && dealerCards.length < 5) {
    const draw = drawN(1, shoe, discardPile, rng);
    dealerCards = [...dealerCards, draw.cards[0]!];
    shoe = draw.shoe;
    discardPile = draw.discardPile;
    dv = handValue(dealerCards);
  }

  const hand = state.playerHand;
  let bankroll = state.bankroll;
  let result = "";

  const dealerPontoon = isPontoon(dealerCards.slice(0, 2)) && dealerCards.length >= 2;
  const dealerFCT = isFiveCardTrick(dealerCards);
  const dealerBust = dv.best > 21;
  const playerPontoon = isPontoon(hand.cards);
  const playerFCT = isFiveCardTrick(hand.cards);

  if (hand.busted) {
    result = `Bust! Lost $${hand.bet}.`;
  } else if (playerPontoon && dealerPontoon) {
    bankroll += hand.bet; // push pontoon vs pontoon
    result = "Pontoon vs Pontoon — Push!";
  } else if (playerPontoon) {
    bankroll += hand.bet + hand.bet * 2; // 2:1 payout
    result = `Pontoon! Wins 2:1 +$${hand.bet * 2}`;
  } else if (dealerPontoon) {
    result = `Dealer Pontoon! Lost $${hand.bet}.`;
  } else if (playerFCT && (dealerBust || !dealerFCT)) {
    bankroll += hand.bet * 2; // FCT wins 1:1 against non-FCT
    result = `Five Card Trick! Win +$${hand.bet}`;
  } else if (dealerFCT && !playerFCT) {
    result = `Dealer Five Card Trick. Lost $${hand.bet}.`;
  } else if (dealerBust) {
    bankroll += hand.bet * 2;
    result = `Dealer bust. Win +$${hand.bet}`;
  } else {
    const pv = handValue(hand.cards).best;
    const dv2 = dv.best;
    if (pv > dv2) {
      bankroll += hand.bet * 2;
      result = `Win! ${pv} vs ${dv2}. +$${hand.bet}`;
    } else if (pv < dv2) {
      result = `Lose. ${pv} vs ${dv2}. -$${hand.bet}`;
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
    lastResult: result,
  };
}

export function initialState(seed: number, settings: PontoonSettings): PontoonState {
  const { rng, nextSeed } = advanceSeed(seed);
  const shoe = shuffle(newDeck(4), rng);
  const bet = parseInt(settings.bet, 10);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerHand: { cards: [], bet, busted: false, twisted: false, doubled: false, bought: false },
    dealerHand: [],
    lastResult: "",
  };
}

export function reducer(state: PontoonState, action: PontoonAction): PontoonState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Deal 2 to player, 2 to dealer (dealer both face-down in real game, but we show them at settle)
      const draw4 = drawN(4, state.shoe, state.discardPile, rng);
      const [p1, d1, p2, d2] = draw4.cards as [Card, Card, Card, Card];

      const playerHand: PontoonHand = {
        cards: [p1, p2],
        bet,
        busted: false,
        twisted: false,
        doubled: false,
        bought: false,
      };

      // Auto-check for pontoon
      if (isPontoon([p1, p2])) {
        return settle({
          ...state,
          rngSeed: nextSeed,
          bankroll: state.bankroll - bet,
          phase: "player",
          shoe: draw4.shoe,
          discardPile: draw4.discardPile,
          playerHand,
          dealerHand: [d1, d2],
          lastResult: "",
        });
      }

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - bet,
        phase: "player",
        shoe: draw4.shoe,
        discardPile: draw4.discardPile,
        playerHand,
        dealerHand: [d1, d2],
        lastResult: "",
      };
    }

    case "twist": {
      if (state.phase !== "player") return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...state.playerHand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const playerHand: PontoonHand = { ...state.playerHand, cards: newCards, busted, twisted: true };

      if (busted || newCards.length === 5) {
        return settle({ ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand });
      }
      return { ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile, playerHand };
    }

    case "stick": {
      if (state.phase !== "player") return state;
      const val = handValue(state.playerHand.cards).best;
      if (val < 15) return state; // must be 15+ to stick
      return settle(state);
    }

    case "buy": {
      if (state.phase !== "player") return state;
      if (state.playerHand.cards.length >= 5) return state;
      if (state.playerHand.twisted) return state; // can't buy after twisting
      if (state.bankroll < state.playerHand.bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawN(1, state.shoe, state.discardPile, rng);
      const newCards = [...state.playerHand.cards, draw.cards[0]!];
      const val = handValue(newCards);
      const busted = val.best > 21;
      const playerHand: PontoonHand = {
        ...state.playerHand,
        cards: newCards,
        bet: state.playerHand.bet * 2,
        bought: true,
        busted,
      };

      if (busted || newCards.length === 5) {
        return settle({
          ...state,
          rngSeed: nextSeed,
          bankroll: state.bankroll - state.playerHand.bet,
          shoe: draw.shoe,
          discardPile: draw.discardPile,
          playerHand,
        });
      }

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - state.playerHand.bet,
        shoe: draw.shoe,
        discardPile: draw.discardPile,
        playerHand,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PontoonState): { score: number } | null {
  if (state.phase !== "settled" && state.phase !== "betting") return null;
  if (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0) {
    return { score: state.bankroll };
  }
  return null;
}
