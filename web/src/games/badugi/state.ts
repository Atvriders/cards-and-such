import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BadugiSettings {
  startingBankroll: "500" | "1000" | "5000";
  anteSize: "10" | "25" | "50";
}

export type BadugiPhase =
  | "waiting"
  | "bet1"
  | "draw1"
  | "bet2"
  | "draw2"
  | "bet3"
  | "draw3"
  | "showdown";

export interface BadugiState {
  settings: BadugiSettings;
  rngSeed: number;
  bankroll: number;
  botBankroll: number;
  handsPlayed: number;
  phase: BadugiPhase;
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[]; // always 4
  botHand: Card[]; // always 4
  pot: number;
  playerBet: number;
  botBet: number;
  playerTurn: boolean;
  selectedToDiscard: number[]; // player card indices
  lastAction: string;
  lastResult: string;
}

export type BadugiAction =
  | { type: "deal" }
  | { type: "check" }
  | { type: "bet" }
  | { type: "call" }
  | { type: "raise" }
  | { type: "fold" }
  | { type: "toggle-discard"; index: number }
  | { type: "draw" };

/**
 * Badugi hand evaluation:
 * Pick largest subset of 4 cards with all distinct suits AND all distinct ranks.
 * Evaluate by highest card in subset (lower is better). Ties: compare next highest, etc.
 * A 4-card badugi beats any 3-card badugi, which beats any 2-card, etc.
 */
export interface BadugiHandRank {
  size: number; // 1..4 (larger is better)
  cards: Card[]; // the qualifying subset, sorted by rank ascending (ace=1=low)
}

export function evaluateBadugi(hand: Card[]): BadugiHandRank {
  // Try all subsets from largest to smallest
  const n = hand.length;
  for (let size = n; size >= 1; size--) {
    const subset = findBestSubset(hand, size);
    if (subset) return { size, cards: subset };
  }
  return { size: 1, cards: [hand[0]!] };
}

function findBestSubset(hand: Card[], size: number): Card[] | null {
  const combos = getCombinations(hand, size);
  let best: Card[] | null = null;
  for (const combo of combos) {
    if (isValidBadugi(combo)) {
      if (!best || compareBadugiSubset(combo, best) > 0) {
        best = combo;
      }
    }
  }
  return best;
}

function isValidBadugi(cards: Card[]): boolean {
  const suits = new Set<Suit>(cards.map(c => c.suit));
  const ranks = new Set<number>(cards.map(c => c.rank));
  return suits.size === cards.length && ranks.size === cards.length;
}

/** Returns positive if combo1 is BETTER (lower) than combo2 */
function compareBadugiSubset(a: Card[], b: Card[]): number {
  // Sort descending (worst card first for comparison)
  const ra = [...a].sort((x, y) => y.rank - x.rank);
  const rb = [...b].sort((x, y) => y.rank - x.rank);
  for (let i = 0; i < Math.max(ra.length, rb.length); i++) {
    const av = ra[i]?.rank ?? 0;
    const bv = rb[i]?.rank ?? 0;
    if (av !== bv) return bv - av; // lower is better
  }
  return 0;
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, size - 1).map(c => [first!, ...c]);
  const withoutFirst = getCombinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

/** Compare two badugi hands: positive = a is better */
export function compareBadugi(a: Card[], b: Card[]): number {
  const ra = evaluateBadugi(a);
  const rb = evaluateBadugi(b);
  if (ra.size !== rb.size) return ra.size - rb.size;
  return compareBadugiSubset(ra.cards, rb.cards);
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** Bot discard: discard cards that share suit or rank with kept cards, keeping lowest */
function botBadugiDiscard(hand: Card[]): number[] {
  // Greedy: keep cards with unique suits & ranks, starting from lowest rank
  const sorted = [...hand].sort((a, b) => a.rank - b.rank); // ace-low
  const keepSuits = new Set<Suit>();
  const keepRanks = new Set<number>();
  const keepIndices = new Set<number>();

  for (const card of sorted) {
    const origIdx = hand.indexOf(card);
    if (!keepSuits.has(card.suit) && !keepRanks.has(card.rank)) {
      keepSuits.add(card.suit);
      keepRanks.add(card.rank);
      keepIndices.add(origIdx);
    }
  }

  return hand.map((_, i) => i).filter(i => !keepIndices.has(i));
}

function botBetDecide(
  hand: Card[],
  toCall: number,
  pot: number,
  betAmt: number,
  rng: () => number
): "check" | "call" | "raise" | "fold" {
  const rank = evaluateBadugi(hand);
  // Strength: size/4 weighted by quality
  const maxCard = Math.max(...rank.cards.map(c => c.rank));
  const strength = rank.size / 4 - maxCard / 56; // 0..1 approx

  if (toCall === 0) {
    if (strength > 0.6) return "raise";
    if (strength > 0.4 && rng() > 0.5) return "raise";
    return "check";
  }

  const equity = strength;
  const odds = toCall / (pot + toCall);
  if (equity > odds + 0.15) return "raise";
  if (equity > odds) return "call";
  if (rng() > 0.8) return "call";
  return "fold";
}

export function initialState(seed: number, settings: BadugiSettings): BadugiState {
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

function doBotDraw(state: BadugiState): BadugiState {
  const discardIndices = botBadugiDiscard(state.botHand);
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

  return { ...state, deck: remaining, discardPile, botHand };
}

type BetPhase = "bet1" | "bet2" | "bet3";
type DrawPhase = "draw1" | "draw2" | "draw3";

function nextPhaseAfterBet(phase: BetPhase): DrawPhase | "showdown" {
  if (phase === "bet1") return "draw1";
  if (phase === "bet2") return "draw2";
  return "draw3";
}

function nextPhaseAfterDraw(phase: DrawPhase): BetPhase {
  if (phase === "draw1") return "bet2";
  return "bet3";
}

function resolveShowdown(state: BadugiState): BadugiState {
  const cmp = compareBadugi(state.playerHand, state.botHand);
  let bankroll = state.bankroll;
  let botBankroll = state.botBankroll;
  let lastResult: string;

  const pRank = evaluateBadugi(state.playerHand);
  const bRank = evaluateBadugi(state.botHand);

  if (cmp > 0) {
    bankroll += state.pot;
    lastResult = `Player wins $${state.pot}! (${pRank.size}-card badugi, best: ${pRank.cards.map(c => c.rank).join("-")})`;
  } else if (cmp < 0) {
    botBankroll += state.pot;
    lastResult = `Bot wins $${state.pot}. (${bRank.size}-card badugi, best: ${bRank.cards.map(c => c.rank).join("-")})`;
  } else {
    const half = Math.floor(state.pot / 2);
    bankroll += half;
    botBankroll += state.pot - half;
    lastResult = "Split pot!";
  }

  return { ...state, phase: "showdown", bankroll, botBankroll, lastResult };
}

function botBet(state: BadugiState, nextPhase: DrawPhase | "showdown"): BadugiState {
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
    if (nextPhase === "showdown") return resolveShowdown({ ...s, lastAction: "Bot: Check" });
    return { ...s, phase: nextPhase, playerBet: 0, botBet: 0, lastAction: "Bot: Check" };
  } else if (action === "call") {
    const callAmt = Math.min(toCall, state.botBankroll);
    const updated = {
      ...s,
      botBet: s.botBet + callAmt,
      botBankroll: s.botBankroll - callAmt,
      pot: s.pot + callAmt,
      lastAction: `Bot: Call $${callAmt}`,
    };
    if (nextPhase === "showdown") return resolveShowdown(updated);
    return { ...updated, phase: nextPhase, playerBet: 0, botBet: 0 };
  } else {
    const raiseAmt = Math.min(toCall + ante, state.botBankroll);
    return {
      ...s,
      botBet: s.botBet + raiseAmt,
      botBankroll: s.botBankroll - raiseAmt,
      pot: s.pot + raiseAmt,
      lastAction: `Bot: Raise $${raiseAmt}`,
      playerTurn: true,
    };
  }
}

function handlePlayerBetAction(
  state: BadugiState,
  playerAction: "check" | "call" | "bet" | "raise" | "fold"
): BadugiState {
  const phase = state.phase as BetPhase;
  const nextP = nextPhaseAfterBet(phase);
  const ante = parseInt(state.settings.anteSize, 10);

  if (playerAction === "fold") {
    return {
      ...state,
      phase: "showdown",
      botBankroll: state.botBankroll + state.pot,
      lastResult: `Player folds. Bot wins $${state.pot}.`,
      lastAction: "Player: Fold",
    };
  } else if (playerAction === "check") {
    const toCall = state.botBet - state.playerBet;
    if (toCall > 0) return state;
    return botBet({ ...state, lastAction: "Player: Check", playerTurn: false }, nextP);
  } else if (playerAction === "call") {
    const toCall = state.botBet - state.playerBet;
    if (toCall <= 0) return state;
    const callAmt = Math.min(toCall, state.bankroll);
    return botBet({
      ...state,
      playerBet: state.playerBet + callAmt,
      bankroll: state.bankroll - callAmt,
      pot: state.pot + callAmt,
      lastAction: `Player: Call $${callAmt}`,
      playerTurn: false,
    }, nextP);
  } else {
    const toCall = state.botBet - state.playerBet;
    const total = toCall + ante;
    if (state.bankroll < total) return state;
    return botBet({
      ...state,
      playerBet: state.playerBet + total,
      bankroll: state.bankroll - total,
      pot: state.pot + total,
      lastAction: `Player: ${toCall > 0 ? "Raise" : "Bet"} $${total}`,
      playerTurn: false,
    }, nextP);
  }
}

export function reducer(state: BadugiState, action: BadugiAction): BadugiState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "waiting" && state.phase !== "showdown") return state;
      if (state.bankroll <= 0 || state.botBankroll <= 0) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const deck = shuffle(newDeck(1), rng);
      const ante = parseInt(state.settings.anteSize, 10);
      const d = deal(deck, 8);
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante,
        botBankroll: state.botBankroll - ante,
        handsPlayed: state.handsPlayed + 1,
        phase: "bet1",
        deck: d.remaining,
        discardPile: [],
        playerHand: d.drawn.slice(0, 4),
        botHand: d.drawn.slice(4, 8),
        pot: ante * 2,
        playerBet: ante,
        botBet: ante,
        playerTurn: true,
        selectedToDiscard: [],
        lastAction: `Antes posted ($${ante} each)`,
        lastResult: "",
      };
    }

    case "fold":
    case "check":
    case "call":
    case "bet":
    case "raise": {
      if (!state.playerTurn) return state;
      if (state.phase !== "bet1" && state.phase !== "bet2" && state.phase !== "bet3") return state;
      const act = action.type === "raise" ? "bet" : action.type;
      return handlePlayerBetAction(state, act as "check" | "call" | "bet" | "fold");
    }

    case "toggle-discard": {
      if (state.phase !== "draw1" && state.phase !== "draw2" && state.phase !== "draw3") return state;
      const { index } = action;
      if (index < 0 || index >= 4) return state;
      const already = state.selectedToDiscard.includes(index);
      const selectedToDiscard = already
        ? state.selectedToDiscard.filter(i => i !== index)
        : [...state.selectedToDiscard, index];
      return { ...state, selectedToDiscard };
    }

    case "draw": {
      if (state.phase !== "draw1" && state.phase !== "draw2" && state.phase !== "draw3") return state;
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

      const drawPhase = state.phase as DrawPhase;
      const nextBetPhase = nextPhaseAfterDraw(drawPhase);

      let s: BadugiState = {
        ...state,
        deck: remaining,
        discardPile,
        playerHand,
        selectedToDiscard: [],
        lastAction: `Player drew ${discardIndices.length} card(s).`,
      };

      // Bot draws
      s = doBotDraw(s);

      // Move to next bet phase
      return {
        ...s,
        phase: nextBetPhase,
        playerBet: 0,
        botBet: 0,
        playerTurn: true,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BadugiState): { score: number } | null {
  if (state.phase === "showdown" && (state.bankroll <= 0 || state.botBankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
