import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { compareHands } from "../_shared/poker.js";

export interface OpenFaceChineseSettings {
  rounds: "1" | "3" | "5";
}

export type OFCRow = "top" | "middle" | "bottom";
export type OFCPhase = "placing" | "scored" | "done";

export interface OFCBoard {
  top: Card[];
  middle: Card[];
  bottom: Card[];
}

export interface OpenFaceChineseState {
  settings: OpenFaceChineseSettings;
  rngSeed: number;
  deck: Card[];
  hand: Card[]; // pending cards player must place 1-by-1
  cardIdx: number; // which card is currently to be placed
  player: OFCBoard;
  cpu: OFCBoard;
  cpuHand: Card[];
  cpuIdx: number;
  phase: OFCPhase;
  message: string;
  round: number;
  totalRounds: number;
  score: number;
}

export type OpenFaceChineseAction =
  | { type: "deal" }
  | { type: "place"; row: OFCRow }
  | { type: "next" };

function nextRng(seed: number): { rng: () => number; nextSeed: number } {
  const r = mulberry32(seed);
  const ns = Math.floor(r() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed: ns };
}

export function initialState(seed: number, settings: OpenFaceChineseSettings): OpenFaceChineseState {
  const totalRounds = parseInt(settings.rounds, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    deck: [],
    hand: [],
    cardIdx: 0,
    player: { top: [], middle: [], bottom: [] },
    cpu: { top: [], middle: [], bottom: [] },
    cpuHand: [],
    cpuIdx: 0,
    phase: "placing",
    message: "Click Deal to start.",
    round: 0,
    totalRounds,
    score: 0,
  };
}

function isFantasyland(_top: Card[]): boolean { return false; } // not modelled here

function dealNew(state: OpenFaceChineseState): OpenFaceChineseState {
  const { rng, nextSeed } = nextRng(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  const playerHand = deck.slice(0, 13);
  const cpuHand = deck.slice(13, 26);
  // Pre-place CPU greedily (best hand at bottom)
  const cpuBoard = greedyPlace(cpuHand);
  return {
    ...state,
    rngSeed: nextSeed,
    deck: deck.slice(26),
    hand: playerHand,
    cardIdx: 0,
    player: { top: [], middle: [], bottom: [] },
    cpu: cpuBoard,
    cpuHand,
    cpuIdx: 13,
    phase: "placing",
    message: "Place each card in top (3), middle (5), or bottom (5).",
    round: state.round + 1,
  };
}

/** Greedy CPU: sort by rank desc, place 5 strongest in bottom, next 5 in middle, last 3 in top.
 *  This is wrong sometimes (might foul) but simple & good enough for solo CPU. */
function greedyPlace(hand: Card[]): OFCBoard {
  const sorted = [...hand].sort((a, b) => {
    const av = a.rank === 1 ? 14 : a.rank;
    const bv = b.rank === 1 ? 14 : b.rank;
    return bv - av;
  });
  const bottom = sorted.slice(0, 5);
  const middle = sorted.slice(5, 10);
  const top = sorted.slice(10, 13);
  return { top, middle, bottom };
}

const CLASS_ORDER = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
] as const;

/** Top is 3 cards — special ranking: pair, trips, or high card only. */
export function rankTop3(top: Card[]): { class: "trips" | "pair" | "high"; kickers: number[] } {
  const ranks = top.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) return { class: "trips", kickers: [ranks[0]!] };
  if (ranks[0] === ranks[1]) return { class: "pair", kickers: [ranks[0]!, ranks[2]!] };
  if (ranks[1] === ranks[2]) return { class: "pair", kickers: [ranks[1]!, ranks[0]!] };
  return { class: "high", kickers: ranks };
}

function rankBottom5(cards: Card[]): ReturnType<typeof rankHand> {
  if (cards.length !== 5) return { class: "high-card", kickers: [0] };
  return rankHand(cards);
}

function compareTop(a: ReturnType<typeof rankTop3>, b: ReturnType<typeof rankTop3>): number {
  const order = ["high", "pair", "trips"] as const;
  const r = order.indexOf(a.class) - order.indexOf(b.class);
  if (r !== 0) return r;
  for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
    const d = (a.kickers[i] ?? 0) - (b.kickers[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Returns true if the OFC board is a valid (non-foul) hand: bottom >= middle >= top. */
export function isValidBoard(board: OFCBoard): boolean {
  if (board.top.length !== 3 || board.middle.length !== 5 || board.bottom.length !== 5) return false;
  const t = rankTop3(board.top);
  const m = rankBottom5(board.middle);
  const b = rankBottom5(board.bottom);
  // bottom >= middle as standard 5-card poker
  if (compareHands(b, m) < 0) return false;
  // middle >= top: convert top to a 5-card "small" rep using only its strength category
  // Since top can only be trips/pair/high, compare via class index.
  const topAsHand = top3ToHandClass(t);
  const midClassIdx = CLASS_ORDER.indexOf(m.class);
  if (midClassIdx < topAsHand) return false;
  if (midClassIdx === topAsHand) {
    // Compare on shared kicker
    if (m.kickers[0]! < (t.kickers[0] ?? 0)) return false;
  }
  return true;
}

function top3ToHandClass(t: ReturnType<typeof rankTop3>): number {
  if (t.class === "trips") return CLASS_ORDER.indexOf("three-of-a-kind");
  if (t.class === "pair") return CLASS_ORDER.indexOf("one-pair");
  return CLASS_ORDER.indexOf("high-card");
}

/** Compare two boards: returns score from player perspective (positive = player wins).
 *  Standard OFC scoring: 1 point per row won, 1 bonus point for sweep (3-0). */
export function scoreBoards(player: OFCBoard, cpu: OFCBoard): number {
  const playerValid = isValidBoard(player);
  const cpuValid = isValidBoard(cpu);
  if (!playerValid && !cpuValid) return 0;
  if (!playerValid) return -6; // foul: lose all rows + scoop bonus
  if (!cpuValid) return 6;
  let pts = 0;
  // top
  const tcmp = compareTop(rankTop3(player.top), rankTop3(cpu.top));
  if (tcmp > 0) pts += 1; else if (tcmp < 0) pts -= 1;
  const mcmp = compareHands(rankBottom5(player.middle), rankBottom5(cpu.middle));
  if (mcmp > 0) pts += 1; else if (mcmp < 0) pts -= 1;
  const bcmp = compareHands(rankBottom5(player.bottom), rankBottom5(cpu.bottom));
  if (bcmp > 0) pts += 1; else if (bcmp < 0) pts -= 1;
  if (pts === 3) pts += 3; // sweep bonus
  if (pts === -3) pts -= 3;
  return pts;
}

export function reducer(state: OpenFaceChineseState, action: OpenFaceChineseAction): OpenFaceChineseState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "placing" && state.phase !== "scored") return state;
    if (state.round >= state.totalRounds) return state;
    if (state.round > 0 && state.phase !== "scored") return state;
    return dealNew(state);
  }
  if (action.type === "place") {
    if (state.phase !== "placing") return state;
    if (state.cardIdx >= state.hand.length) return state;
    const card = state.hand[state.cardIdx]!;
    const row = action.row;
    const max = row === "top" ? 3 : 5;
    if (state.player[row].length >= max) return state;
    const player = { ...state.player, [row]: [...state.player[row], card] };
    const cardIdx = state.cardIdx + 1;
    if (cardIdx >= state.hand.length) {
      // All placed → score
      const scoreDelta = scoreBoards(player, state.cpu);
      const newScore = state.score + scoreDelta;
      const isLast = state.round >= state.totalRounds;
      return {
        ...state,
        player,
        cardIdx,
        phase: isLast ? "done" : "scored",
        score: newScore,
        message: scoreDelta === 0 ? "Tied round." : scoreDelta > 0 ? `You win round (+${scoreDelta}).` : `CPU wins round (${scoreDelta}).`,
      };
    }
    return { ...state, player, cardIdx, message: `${state.hand.length - cardIdx} cards left.` };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, phase: "placing", message: "Click Deal to start next round." };
  }
  return state;
}

export function isTerminal(state: OpenFaceChineseState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}

export { isFantasyland };
