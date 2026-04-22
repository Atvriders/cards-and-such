import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface FiveCardDrawSettings {
  startingBankroll: "500" | "1000" | "5000";
  anteSize: "10" | "25" | "50";
}

export type DrawPhase = "waiting" | "pre-draw-bet" | "draw" | "post-draw-bet" | "showdown";

export interface FiveCardDrawState {
  settings: FiveCardDrawSettings;
  rngSeed: number;
  bankroll: number;
  botBankroll: number;
  handsPlayed: number;
  phase: DrawPhase;
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  botHand: Card[];
  pot: number;
  playerBet: number;
  botBet: number;
  playerTurn: boolean;
  selectedToDiscard: number[]; // indices of player cards to discard
  lastAction: string;
  lastResult: string;
}

export type DrawAction =
  | { type: "deal" }
  | { type: "check" }
  | { type: "bet" }
  | { type: "call" }
  | { type: "raise" }
  | { type: "fold" }
  | { type: "toggle-discard"; index: number }
  | { type: "draw" };

const CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

function compareHandArr(a: Card[], b: Card[]): number {
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

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** Bot discard strategy: discard to improve, keep best combination */
function botDiscard(hand: Card[]): number[] {
  const h = rankHand(hand);
  const HIGH = (r: number) => r === 1 ? 14 : r;
  const ranks = hand.map((c) => HIGH(c.rank));
  const suits = hand.map((c) => c.suit);

  if (h.class === "four-of-a-kind" || h.class === "straight-flush" || h.class === "full-house") {
    return []; // keep
  }
  if (h.class === "three-of-a-kind") {
    // keep the trip, discard the two kickers
    const tripRank = h.kickers[0]!;
    const tripIndices = hand.reduce<number[]>((acc, c, i) => HIGH(c.rank) === tripRank ? [...acc, i] : acc, []);
    return hand.map((_, i) => i).filter(i => !tripIndices.includes(i));
  }
  if (h.class === "two-pair") {
    // keep two pairs, discard kicker
    const p1 = h.kickers[0]!, p2 = h.kickers[1]!;
    const kicker = hand.findIndex(c => HIGH(c.rank) !== p1 && HIGH(c.rank) !== p2);
    return kicker >= 0 ? [kicker] : [];
  }
  if (h.class === "one-pair") {
    // keep pair, discard 3 non-pair cards
    const pairRank = h.kickers[0]!;
    const pairIndices = hand.reduce<number[]>((acc, c, i) => HIGH(c.rank) === pairRank ? [...acc, i] : acc, []);
    return hand.map((_, i) => i).filter(i => !pairIndices.includes(i));
  }
  // High card: discard 3 lowest, keep 2 highest
  const sorted = [...ranks].sort((a, b) => b - a);
  const keep = new Set([sorted[0], sorted[1]]);
  const discarded: number[] = [];
  const kept: number[] = [];
  for (let i = 0; i < hand.length; i++) {
    if (keep.has(ranks[i]!) && kept.length < 2) {
      kept.push(i);
    } else {
      discarded.push(i);
    }
  }
  return discarded.slice(0, 3);
}

function botBetDecide(
  hand: Card[],
  toCall: number,
  pot: number,
  betAmt: number,
  rng: () => number
): "check" | "call" | "raise" | "fold" {
  const strength = CLASS_ORDER.indexOf(rankHand(hand).class);

  if (toCall === 0) {
    if (strength >= 4) return "raise";
    if (strength >= 2 && rng() > 0.5) return "raise";
    return "check";
  }

  const equity = (strength + 1) / 9;
  const odds = toCall / (pot + toCall);
  if (equity > odds + 0.15 && strength >= 3) return "raise";
  if (equity > odds) return "call";
  if (rng() > 0.8) return "call";
  return "fold";
}

export function initialState(seed: number, settings: FiveCardDrawSettings): FiveCardDrawState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deck = shuffle(newDeck(1), rng);
  const bankroll = parseInt(settings.startingBankroll, 10);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll,
    botBankroll: bankroll,
    handsPlayed: 0,
    phase: "waiting",
    deck,
    discardPile: [],
    playerHand: [],
    botHand: [],
    pot: 0,
    playerBet: 0,
    botBet: 0,
    playerTurn: true,
    selectedToDiscard: [],
    lastAction: "",
    lastResult: "",
  };
}

function botPreDrawBet(state: FiveCardDrawState): FiveCardDrawState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const ante = parseInt(state.settings.anteSize, 10);
  const toCall = state.playerBet - state.botBet;

  const action = botBetDecide(state.botHand, toCall, state.pot, ante, rng);
  let s = { ...state, rngSeed: nextSeed, playerTurn: true };

  if (action === "fold") {
    return {
      ...s,
      phase: "showdown",
      bankroll: state.bankroll + state.pot,
      lastResult: `Bot folds. Player wins $${state.pot}!`,
      lastAction: "Bot: Fold",
    };
  } else if (action === "check") {
    return { ...s, phase: "draw", lastAction: "Bot: Check", selectedToDiscard: [] };
  } else if (action === "call") {
    const callAmt = Math.min(toCall, state.botBankroll);
    return {
      ...s,
      botBet: state.botBet + callAmt,
      botBankroll: state.botBankroll - callAmt,
      pot: state.pot + callAmt,
      phase: "draw",
      lastAction: `Bot: Call $${callAmt}`,
      selectedToDiscard: [],
    };
  } else {
    const raiseAmt = Math.min(toCall + ante, state.botBankroll);
    return {
      ...s,
      botBet: state.botBet + raiseAmt,
      botBankroll: state.botBankroll - raiseAmt,
      pot: state.pot + raiseAmt,
      lastAction: `Bot: Raise $${raiseAmt}`,
      playerTurn: true,
    };
  }
}

function botPostDrawBet(state: FiveCardDrawState): FiveCardDrawState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const ante = parseInt(state.settings.anteSize, 10);
  const toCall = state.playerBet - state.botBet;

  const action = botBetDecide(state.botHand, toCall, state.pot, ante, rng);
  let s = { ...state, rngSeed: nextSeed, playerTurn: true };

  if (action === "fold") {
    return {
      ...s,
      phase: "showdown",
      bankroll: state.bankroll + state.pot,
      lastResult: `Bot folds. Player wins $${state.pot}!`,
      lastAction: "Bot: Fold",
    };
  } else if (action === "check") {
    return resolveShowdown({ ...s, lastAction: "Bot: Check" });
  } else if (action === "call") {
    const callAmt = Math.min(toCall, state.botBankroll);
    return resolveShowdown({
      ...s,
      botBet: state.botBet + callAmt,
      botBankroll: state.botBankroll - callAmt,
      pot: state.pot + callAmt,
      lastAction: `Bot: Call $${callAmt}`,
    });
  } else {
    const raiseAmt = Math.min(toCall + ante, state.botBankroll);
    return {
      ...s,
      botBet: state.botBet + raiseAmt,
      botBankroll: state.botBankroll - raiseAmt,
      pot: state.pot + raiseAmt,
      lastAction: `Bot: Raise $${raiseAmt}`,
      playerTurn: true,
    };
  }
}

function resolveShowdown(state: FiveCardDrawState): FiveCardDrawState {
  const cmp = compareHandArr(state.playerHand, state.botHand);
  let bankroll = state.bankroll;
  let botBankroll = state.botBankroll;
  let lastResult: string;

  if (cmp > 0) {
    bankroll += state.pot;
    lastResult = `Player wins $${state.pot}! (${rankHand(state.playerHand).class})`;
  } else if (cmp < 0) {
    botBankroll += state.pot;
    lastResult = `Bot wins $${state.pot}. (${rankHand(state.botHand).class})`;
  } else {
    const half = Math.floor(state.pot / 2);
    bankroll += half;
    botBankroll += state.pot - half;
    lastResult = "Split pot!";
  }

  return { ...state, phase: "showdown", bankroll, botBankroll, lastResult };
}

function doBotDraw(state: FiveCardDrawState): FiveCardDrawState {
  const discardIndices = botDiscard(state.botHand);
  const keep = state.botHand.filter((_, i) => !discardIndices.includes(i));
  const discards = state.botHand.filter((_, i) => discardIndices.includes(i));

  let deck = state.deck;
  let discardPile = [...state.discardPile, ...discards];
  if (deck.length < discardIndices.length + 5) {
    const { rng } = advanceSeed(state.rngSeed);
    deck = shuffle([...deck, ...discardPile], rng);
    discardPile = [];
  }
  const { drawn, remaining } = deal(deck, discardIndices.length);
  const botHand = [...keep, ...drawn];

  return {
    ...state,
    deck: remaining,
    discardPile,
    botHand,
    phase: "post-draw-bet",
    playerBet: 0,
    botBet: 0,
    playerTurn: true,
    lastAction: `Bot drew ${discardIndices.length} card(s).`,
  };
}

export function reducer(state: FiveCardDrawState, action: DrawAction): FiveCardDrawState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "waiting" && state.phase !== "showdown") return state;
      if (state.bankroll <= 0 || state.botBankroll <= 0) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const deck = shuffle(newDeck(1), rng);
      const ante = parseInt(state.settings.anteSize, 10);
      const d = deal(deck, 10);
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante,
        botBankroll: state.botBankroll - ante,
        handsPlayed: state.handsPlayed + 1,
        phase: "pre-draw-bet",
        deck: d.remaining,
        discardPile: [],
        playerHand: d.drawn.slice(0, 5),
        botHand: d.drawn.slice(5, 10),
        pot: ante * 2,
        playerBet: ante,
        botBet: ante,
        playerTurn: true,
        selectedToDiscard: [],
        lastAction: `Antes posted ($${ante} each)`,
        lastResult: "",
      };
    }
    case "fold": {
      if (!state.playerTurn || (state.phase !== "pre-draw-bet" && state.phase !== "post-draw-bet")) return state;
      return {
        ...state,
        phase: "showdown",
        botBankroll: state.botBankroll + state.pot,
        lastResult: `Player folds. Bot wins $${state.pot}.`,
        lastAction: "Player: Fold",
      };
    }
    case "check": {
      if (!state.playerTurn || (state.phase !== "pre-draw-bet" && state.phase !== "post-draw-bet")) return state;
      if (state.botBet - state.playerBet > 0) return state;
      if (state.phase === "pre-draw-bet") {
        return botPreDrawBet({ ...state, lastAction: "Player: Check", playerTurn: false });
      } else {
        return botPostDrawBet({ ...state, lastAction: "Player: Check", playerTurn: false });
      }
    }
    case "call": {
      if (!state.playerTurn || (state.phase !== "pre-draw-bet" && state.phase !== "post-draw-bet")) return state;
      const toCall = state.botBet - state.playerBet;
      if (toCall <= 0) return state;
      const callAmt = Math.min(toCall, state.bankroll);
      const s = {
        ...state,
        playerBet: state.playerBet + callAmt,
        bankroll: state.bankroll - callAmt,
        pot: state.pot + callAmt,
        lastAction: `Player: Call $${callAmt}`,
        playerTurn: false,
      };
      if (state.phase === "pre-draw-bet") return botPreDrawBet(s);
      return botPostDrawBet(s);
    }
    case "bet":
    case "raise": {
      if (!state.playerTurn || (state.phase !== "pre-draw-bet" && state.phase !== "post-draw-bet")) return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const toCall = state.botBet - state.playerBet;
      const total = toCall + ante;
      if (state.bankroll < total) return state;
      const s = {
        ...state,
        playerBet: state.playerBet + total,
        bankroll: state.bankroll - total,
        pot: state.pot + total,
        lastAction: `Player: ${toCall > 0 ? "Raise" : "Bet"} $${total}`,
        playerTurn: false,
      };
      if (state.phase === "pre-draw-bet") return botPreDrawBet(s);
      return botPostDrawBet(s);
    }
    case "toggle-discard": {
      if (state.phase !== "draw") return state;
      const { index } = action;
      if (index < 0 || index >= 5) return state;
      const already = state.selectedToDiscard.includes(index);
      const selectedToDiscard = already
        ? state.selectedToDiscard.filter(i => i !== index)
        : [...state.selectedToDiscard, index];
      return { ...state, selectedToDiscard };
    }
    case "draw": {
      if (state.phase !== "draw") return state;
      const discardIndices = state.selectedToDiscard;
      const keep = state.playerHand.filter((_, i) => !discardIndices.includes(i));
      const discards = state.playerHand.filter((_, i) => discardIndices.includes(i));

      let deck = state.deck;
      let discardPile = [...state.discardPile, ...discards];
      if (deck.length < discardIndices.length + 5) {
        const { rng } = advanceSeed(state.rngSeed);
        deck = shuffle([...deck, ...discardPile], rng);
        discardPile = [];
      }
      const { drawn, remaining } = deal(deck, discardIndices.length);
      const playerHand = [...keep, ...drawn];

      const s = {
        ...state,
        deck: remaining,
        discardPile,
        playerHand,
        selectedToDiscard: [],
        lastAction: `Player drew ${discardIndices.length} card(s).`,
      };
      return doBotDraw(s);
    }
    default:
      return state;
  }
}

export function isTerminal(state: FiveCardDrawState): { score: number } | null {
  if (state.phase === "showdown" && (state.bankroll <= 0 || state.botBankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
