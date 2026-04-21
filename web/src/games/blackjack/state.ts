import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BlackjackSettings {
  handsPerSession: number;
  bet: "5" | "10" | "25" | "100";
  deckCount: "1" | "4" | "6" | "8";
  dealerHitsSoft17: boolean;
}

export type BlackjackPhase = "betting" | "player" | "dealer" | "settled";

export interface BlackjackHand {
  cards: Card[];
  bet: number;
  doubled: boolean;
  busted: boolean;
  stood: boolean;
}

export interface BlackjackState {
  settings: BlackjackSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: BlackjackPhase;
  shoe: Card[];
  discardPile: Card[];
  playerHands: BlackjackHand[];
  activeHandIndex: number;
  dealerHand: Card[];
  dealerFaceDown: boolean; // dealer's second card hidden
  lastResult: string; // description of last hand outcome
}

export type BlackjackAction =
  | { type: "deal" }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" }
  | { type: "split" }
  | { type: "end-session" };

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

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function buildShoe(deckCount: number, rng: () => number): Card[] {
  return shuffle(newDeck(deckCount), rng);
}

function drawCard(shoe: Card[], discardPile: Card[], rng: () => number): {
  card: Card;
  shoe: Card[];
  discardPile: Card[];
} {
  if (shoe.length < 15) {
    // reshuffle discard into new shoe
    const combined = [...shoe, ...discardPile];
    const reshuffled = shuffle(combined, rng);
    const { drawn, remaining } = deal(reshuffled, 1);
    return { card: drawn[0]!, shoe: remaining, discardPile: [] };
  }
  const { drawn, remaining } = deal(shoe, 1);
  return { card: drawn[0]!, shoe: remaining, discardPile };
}

function drawN(n: number, shoe: Card[], discardPile: Card[], rng: () => number): {
  cards: Card[];
  shoe: Card[];
  discardPile: Card[];
} {
  let currentShoe = shoe;
  let currentDiscard = discardPile;
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    const result = drawCard(currentShoe, currentDiscard, rng);
    cards.push(result.card);
    currentShoe = result.shoe;
    currentDiscard = result.discardPile;
  }
  return { cards, shoe: currentShoe, discardPile: currentDiscard };
}

export function initialState(seed: number, settings: BlackjackSettings): BlackjackState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deckCount = parseInt(settings.deckCount, 10);
  const shoe = buildShoe(deckCount, rng);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    dealerFaceDown: false,
    lastResult: "",
  };
}

function settleHands(state: BlackjackState): BlackjackState {
  // Dealer plays automatically
  let dealerCards = [...state.dealerHand];
  let shoe = state.shoe;
  let discardPile = state.discardPile;

  const { rng, nextSeed } = advanceSeed(state.rngSeed);

  // Dealer draws until >= 17 (or > 17 if hits soft 17)
  let dealerVal = handValue(dealerCards);
  while (
    dealerVal.best < 17 ||
    (state.settings.dealerHitsSoft17 && dealerVal.best === 17 && dealerVal.soft)
  ) {
    const result = drawCard(shoe, discardPile, rng);
    dealerCards = [...dealerCards, result.card];
    shoe = result.shoe;
    discardPile = result.discardPile;
    dealerVal = handValue(dealerCards);
  }

  const dealerBJ = isBlackjack(state.dealerHand); // original 2 cards
  const dealerBust = dealerVal.best > 21;
  const dealerScore = dealerVal.best;

  let bankroll = state.bankroll;
  const resultParts: string[] = [];

  for (const hand of state.playerHands) {
    const playerVal = handValue(hand.cards);
    const playerBJ = isBlackjack(hand.cards) && state.playerHands.length === 1;

    if (hand.busted) {
      resultParts.push(`Bust (-$${hand.bet})`);
      // bankroll already deducted during play
    } else if (playerBJ && dealerBJ) {
      bankroll += hand.bet; // push, refund
      resultParts.push("Push (BJ vs BJ)");
    } else if (playerBJ) {
      bankroll += hand.bet + Math.floor(hand.bet * 1.5); // 3:2 payout
      resultParts.push(`Blackjack! +$${Math.floor(hand.bet * 1.5)}`);
    } else if (dealerBJ) {
      resultParts.push(`Dealer BJ (-$${hand.bet})`);
    } else if (dealerBust) {
      bankroll += hand.bet * 2; // win
      resultParts.push(`Dealer bust! +$${hand.bet}`);
    } else if (playerVal.best > dealerScore) {
      bankroll += hand.bet * 2;
      resultParts.push(`Win! +$${hand.bet}`);
    } else if (playerVal.best < dealerScore) {
      resultParts.push(`Lose (-$${hand.bet})`);
    } else {
      bankroll += hand.bet; // push, refund
      resultParts.push("Push");
    }
  }

  // Move all played cards to discard
  const allCards = [
    ...state.playerHands.flatMap((h) => h.cards),
    ...dealerCards,
  ];
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
    lastResult: resultParts.join(" | "),
  };
}

export function reducer(state: BlackjackState, action: BlackjackAction): BlackjackState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      // Check terminal conditions
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      if (state.bankroll <= 0) return state;

      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      let shoe = state.shoe;
      let discardPile = state.discardPile;

      // Deal: player card, dealer card, player card, dealer face-down card
      const draw4 = drawN(4, shoe, discardPile, rng);
      shoe = draw4.shoe;
      discardPile = draw4.discardPile;
      const [p1, d1, p2, d2] = draw4.cards as [Card, Card, Card, Card];

      const playerHand: BlackjackHand = {
        cards: [p1, p2],
        bet,
        doubled: false,
        busted: false,
        stood: false,
      };

      const newState: BlackjackState = {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - bet,
        phase: "player",
        shoe,
        discardPile,
        playerHands: [playerHand],
        activeHandIndex: 0,
        dealerHand: [d1, d2],
        dealerFaceDown: true,
        lastResult: "",
      };

      // Check for immediate blackjack (both parties)
      const playerBJ = isBlackjack([p1, p2]);
      const dealerBJ = isBlackjack([d1, d2]);

      if (playerBJ || dealerBJ) {
        return settleHands(newState);
      }

      return newState;
    }

    case "hit": {
      if (state.phase !== "player") return state;
      const hand = state.playerHands[state.activeHandIndex];
      if (!hand) return state;
      if (hand.stood || hand.busted) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const result = drawCard(state.shoe, state.discardPile, rng);

      const newCards = [...hand.cards, result.card];
      const val = handValue(newCards);
      const busted = val.best > 21;

      const newHand: BlackjackHand = { ...hand, cards: newCards, busted };
      const newHands = state.playerHands.map((h, i) =>
        i === state.activeHandIndex ? newHand : h
      );

      const newState: BlackjackState = {
        ...state,
        rngSeed: nextSeed,
        shoe: result.shoe,
        discardPile: result.discardPile,
        playerHands: newHands,
      };

      if (busted) {
        // Move to next hand or settle
        return advanceHand(newState);
      }

      return newState;
    }

    case "stand": {
      if (state.phase !== "player") return state;
      const hand = state.playerHands[state.activeHandIndex];
      if (!hand) return state;

      const newHand: BlackjackHand = { ...hand, stood: true };
      const newHands = state.playerHands.map((h, i) =>
        i === state.activeHandIndex ? newHand : h
      );

      return advanceHand({ ...state, playerHands: newHands });
    }

    case "double": {
      if (state.phase !== "player") return state;
      const hand = state.playerHands[state.activeHandIndex];
      if (!hand) return state;
      // Only on first two cards
      if (hand.cards.length !== 2) return state;
      if (state.bankroll < hand.bet) return state; // can't afford to double

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const result = drawCard(state.shoe, state.discardPile, rng);

      const newCards = [...hand.cards, result.card];
      const val = handValue(newCards);
      const busted = val.best > 21;

      const newBet = hand.bet * 2;
      const bankroll = state.bankroll - hand.bet; // deduct extra bet

      const newHand: BlackjackHand = {
        ...hand,
        cards: newCards,
        bet: newBet,
        doubled: true,
        busted,
        stood: !busted, // auto-stand after double
      };
      const newHands = state.playerHands.map((h, i) =>
        i === state.activeHandIndex ? newHand : h
      );

      return advanceHand({
        ...state,
        rngSeed: nextSeed,
        bankroll,
        shoe: result.shoe,
        discardPile: result.discardPile,
        playerHands: newHands,
      });
    }

    case "split": {
      if (state.phase !== "player") return state;
      const hand = state.playerHands[state.activeHandIndex];
      if (!hand) return state;
      // Only on first two cards of matching rank
      if (hand.cards.length !== 2) return state;
      if (hand.cards[0]!.rank !== hand.cards[1]!.rank) return state;
      // Only one split allowed (no re-splitting)
      if (state.playerHands.length > 1) return state;
      if (state.bankroll < hand.bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Draw one card for each split hand
      const draw2 = drawN(2, state.shoe, state.discardPile, rng);

      const hand1: BlackjackHand = {
        cards: [hand.cards[0]!, draw2.cards[0]!],
        bet: hand.bet,
        doubled: false,
        busted: false,
        stood: false,
      };
      const hand2: BlackjackHand = {
        cards: [hand.cards[1]!, draw2.cards[1]!],
        bet: hand.bet,
        doubled: false,
        busted: false,
        stood: false,
      };

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - hand.bet, // extra bet for split hand
        shoe: draw2.shoe,
        discardPile: draw2.discardPile,
        playerHands: [hand1, hand2],
        activeHandIndex: 0,
      };
    }

    case "end-session": {
      return { ...state, phase: "settled", handsPlayed: state.settings.handsPerSession };
    }

    default:
      return state;
  }
}

function advanceHand(state: BlackjackState): BlackjackState {
  const nextIndex = state.activeHandIndex + 1;
  if (nextIndex < state.playerHands.length) {
    return { ...state, activeHandIndex: nextIndex };
  }
  // All hands done — dealer plays and settle
  return settleHands(state);
}

export function isTerminal(state: BlackjackState): { score: number } | null {
  if (state.phase !== "settled" && state.phase !== "betting") return null;
  if (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0) {
    return { score: state.bankroll };
  }
  return null;
}
