import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cribbage Mini: stripped-down 2-card cribbage racing to 31 points (a "short street").
// Each round both players are dealt 4 cards each, choose 2 to keep, then 2 to discard
// to the crib. A starter card is cut. Each player scores their 2-card hand + starter:
//   - "fifteen" (any subset summing to 15) = 2pts
//   - pair = 2pts (only possible if both cards same rank)
//   - run of 3 (3 consecutive ranks) = 3pts
//   - flush of 3 (all same suit) = 3pts
//   - "his nob": jack matching starter suit = 1pt
// Crib is scored for the dealer. First to 31 points wins.

export const TARGET_SCORE = 31;
export const HAND_SIZE = 4;
export const KEEP_SIZE = 2;

export interface CribbageMiniSettings {
  dummy: boolean;
}

export interface CribbageMiniState {
  rngSeed: number;
  deck: number[]; // remaining cards 0..51
  yourHand: number[]; // cards in hand
  botHand: number[];
  selected: number[]; // your selected indices into yourHand to discard to crib
  crib: number[];
  starter: number | null;
  yourScore: number;
  botScore: number;
  dealer: 0 | 1; // 0 = you, 1 = bot — alternates each hand
  phase: "discard" | "show" | "done";
  lastBreakdown: {
    youHand: number; youCrib: number; bot: number;
    youDetails: string[]; botDetails: string[];
  } | null;
  winner: 0 | 1 | null;
  settings: CribbageMiniSettings;
}

export type CribbageMiniAction =
  | { type: "toggleSelect"; idx: number }
  | { type: "submit" }
  | { type: "next" };

// Card representation: 0..51 = rank * 4 + suit. Rank 0=A,1=2..,12=K
export function rankOf(c: number): number { return Math.floor(c / 4); }
export function suitOf(c: number): number { return c % 4; }

// Cribbage card values: A=1, 2..9=face, 10/J/Q/K=10
export function cardValue(c: number): number {
  const r = rankOf(c);
  if (r === 0) return 1;
  if (r >= 9) return 10;
  return r + 1;
}

export function cardLabel(c: number): string {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[rankOf(c)]! + suits[suitOf(c)]!;
}

function shuffle(arr: number[], rng: () => number): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// Score a "show" of cards (hand + starter included). For 3-card mini show.
export function scoreShow(cards: number[], isCrib: boolean): { score: number; details: string[] } {
  const details: string[] = [];
  let score = 0;

  // 15s — count subsets summing to 15
  let fifteens = 0;
  const n = cards.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    let sum = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += cardValue(cards[i]!);
    if (sum === 15) fifteens++;
  }
  if (fifteens > 0) {
    score += fifteens * 2;
    details.push(`${fifteens}× fifteen = ${fifteens * 2}pts`);
  }

  // Pairs
  const ranks = cards.map(rankOf);
  let pairs = 0;
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      if (ranks[i] === ranks[j]) pairs++;
    }
  }
  if (pairs > 0) {
    score += pairs * 2;
    details.push(`${pairs}× pair = ${pairs * 2}pts`);
  }

  // Run (3 consecutive). Find longest run.
  const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
  let bestRun = 1;
  let cur = 1;
  for (let i = 1; i < sortedRanks.length; i++) {
    if (sortedRanks[i]! === sortedRanks[i - 1]! + 1) cur++;
    else cur = 1;
    if (cur > bestRun) bestRun = cur;
  }
  if (bestRun >= 3) {
    score += bestRun;
    details.push(`run of ${bestRun} = ${bestRun}pts`);
  }

  // Flush of 3+ (in mini's 3-card show, all same suit)
  if (cards.length >= 3) {
    const suits = cards.map(suitOf);
    if (suits.every((s) => s === suits[0])) {
      // For crib, all 3 must include starter suit too — already does since cards include starter
      // For non-crib, 3-card flush is fine but in real cribbage 4-card hand needs all 4 same; here we use 3.
      const flushScore = isCrib ? cards.length : cards.length;
      score += flushScore;
      details.push(`flush ${flushScore} = ${flushScore}pts`);
    }
  }

  return { score, details };
}

function dealHands(rng: () => number): { deck: number[]; you: number[]; bot: number[] } {
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
  return {
    deck: deck.slice(8),
    you: deck.slice(0, HAND_SIZE),
    bot: deck.slice(HAND_SIZE, HAND_SIZE * 2),
  };
}

function botPickDiscards(hand: number[]): number[] {
  // Bot picks the worst 2 (lowest individual rank value sum) to discard
  const idx = hand.map((_, i) => i);
  idx.sort((a, b) => cardValue(hand[a]!) - cardValue(hand[b]!));
  return [idx[0]!, idx[1]!];
}

export function initialState(seed: number, settings: CribbageMiniSettings): CribbageMiniState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const { deck, you, bot } = dealHands(rng);
  return {
    rngSeed: nextSeed,
    deck,
    yourHand: you,
    botHand: bot,
    selected: [],
    crib: [],
    starter: null,
    yourScore: 0,
    botScore: 0,
    dealer: 0,
    phase: "discard",
    lastBreakdown: null,
    winner: null,
    settings,
  };
}

export function reducer(state: CribbageMiniState, action: CribbageMiniAction): CribbageMiniState {
  if (state.phase === "done") return state;

  if (action.type === "toggleSelect") {
    if (state.phase !== "discard") return state;
    const { idx } = action;
    if (idx < 0 || idx >= state.yourHand.length) return state;
    const sel = state.selected.includes(idx)
      ? state.selected.filter((i) => i !== idx)
      : state.selected.length < KEEP_SIZE
        ? [...state.selected, idx]
        : state.selected;
    return { ...state, selected: sel };
  }

  if (action.type === "submit") {
    if (state.phase !== "discard") return state;
    if (state.selected.length !== KEEP_SIZE) return state;
    // Discard selected cards to crib; keep the rest
    const yourDiscards = state.selected.map((i) => state.yourHand[i]!);
    const yourKeep = state.yourHand.filter((_, i) => !state.selected.includes(i));
    const botDiscardIdx = botPickDiscards(state.botHand);
    const botDiscards = botDiscardIdx.map((i) => state.botHand[i]!);
    const botKeep = state.botHand.filter((_, i) => !botDiscardIdx.includes(i));
    const crib = [...yourDiscards, ...botDiscards];

    // Cut starter
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const starterIdx = Math.floor(rng() * state.deck.length);
    const starter = state.deck[starterIdx]!;

    // Score hands (3-card show: 2 hand + starter)
    const youShow = scoreShow([...yourKeep, starter], false);
    const botShow = scoreShow([...botKeep, starter], false);
    // Crib goes to dealer
    const cribShow = scoreShow([...crib, starter], true);
    let yourCrib = 0, botCrib = 0;
    if (state.dealer === 0) yourCrib = cribShow.score;
    else botCrib = cribShow.score;

    const youGain = youShow.score + yourCrib;
    const botGain = botShow.score + botCrib;
    const youTotal = state.yourScore + youGain;
    const botTotal = state.botScore + botGain;

    let winner: 0 | 1 | null = null;
    if (youTotal >= TARGET_SCORE) winner = 0;
    else if (botTotal >= TARGET_SCORE) winner = 1;

    return {
      ...state,
      rngSeed: nextSeed,
      yourHand: yourKeep,
      botHand: botKeep,
      crib,
      starter,
      yourScore: youTotal,
      botScore: botTotal,
      lastBreakdown: {
        youHand: youShow.score,
        youCrib: yourCrib,
        bot: botShow.score + botCrib,
        youDetails: youShow.details,
        botDetails: [
          ...botShow.details,
          ...(botCrib > 0 ? [`crib ${botCrib}pts`] : []),
        ],
      },
      phase: winner !== null ? "done" : "show",
      winner,
      selected: [],
    };
  }

  if (action.type === "next") {
    if (state.phase !== "show") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { deck, you, bot } = dealHands(rng);
    return {
      ...state,
      rngSeed: nextSeed,
      deck,
      yourHand: you,
      botHand: bot,
      selected: [],
      crib: [],
      starter: null,
      dealer: state.dealer === 0 ? 1 : 0,
      phase: "discard",
      lastBreakdown: null,
    };
  }

  return state;
}

export function isTerminal(state: CribbageMiniState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.winner === 0) return { score: 100 + state.yourScore };
  return { score: state.yourScore };
}
