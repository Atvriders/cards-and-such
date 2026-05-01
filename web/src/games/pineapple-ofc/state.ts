import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { compareHands } from "../_shared/poker.js";

export interface PineappleOfcSettings {
  rounds: "1" | "3" | "5";
}

export type PineapOfcPhase = "initial-place" | "drawing" | "draw-place" | "discard" | "scored" | "done";
export type OFCRow = "top" | "middle" | "bottom";

export interface OFCBoard {
  top: Card[];
  middle: Card[];
  bottom: Card[];
}

export interface PineappleOfcState {
  settings: PineappleOfcSettings;
  rngSeed: number;
  deck: Card[];
  /** Cards in hand awaiting placement: 5 first time, 3 in subsequent rounds. */
  hand: Card[];
  cardIdx: number;
  player: OFCBoard;
  cpu: OFCBoard;
  phase: PineapOfcPhase;
  message: string;
  round: number;
  totalRounds: number;
  /** Within a single deal (1 hand): how many 3-card draws done? Cap = 4. */
  drawNum: number;
  score: number;
}

export type PineappleOfcAction =
  | { type: "deal" }
  | { type: "place"; row: OFCRow; cardIndex?: number }
  | { type: "discard"; cardIndex: number }
  | { type: "next" };

const CLASS_ORDER = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
] as const;

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

export function isValidBoard(board: OFCBoard): boolean {
  if (board.top.length !== 3 || board.middle.length !== 5 || board.bottom.length !== 5) return false;
  const t = rankTop3(board.top);
  const m = rankBottom5(board.middle);
  const b = rankBottom5(board.bottom);
  if (compareHands(b, m) < 0) return false;
  const topClassIdx = t.class === "trips"
    ? CLASS_ORDER.indexOf("three-of-a-kind")
    : t.class === "pair" ? CLASS_ORDER.indexOf("one-pair") : CLASS_ORDER.indexOf("high-card");
  const midClassIdx = CLASS_ORDER.indexOf(m.class);
  if (midClassIdx < topClassIdx) return false;
  if (midClassIdx === topClassIdx && m.kickers[0]! < (t.kickers[0] ?? 0)) return false;
  return true;
}

export function scoreBoards(player: OFCBoard, cpu: OFCBoard): number {
  const pV = isValidBoard(player);
  const cV = isValidBoard(cpu);
  if (!pV && !cV) return 0;
  if (!pV) return -6;
  if (!cV) return 6;
  let pts = 0;
  const tcmp = compareTop(rankTop3(player.top), rankTop3(cpu.top));
  if (tcmp > 0) pts += 1; else if (tcmp < 0) pts -= 1;
  const mcmp = compareHands(rankBottom5(player.middle), rankBottom5(cpu.middle));
  if (mcmp > 0) pts += 1; else if (mcmp < 0) pts -= 1;
  const bcmp = compareHands(rankBottom5(player.bottom), rankBottom5(cpu.bottom));
  if (bcmp > 0) pts += 1; else if (bcmp < 0) pts -= 1;
  if (pts === 3) pts += 3;
  if (pts === -3) pts -= 3;
  return pts;
}

function nextRng(seed: number): { rng: () => number; nextSeed: number } {
  const r = mulberry32(seed);
  const ns = Math.floor(r() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed: ns };
}

export function initialState(seed: number, settings: PineappleOfcSettings): PineappleOfcState {
  const totalRounds = parseInt(settings.rounds, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    deck: [],
    hand: [],
    cardIdx: 0,
    player: { top: [], middle: [], bottom: [] },
    cpu: { top: [], middle: [], bottom: [] },
    phase: "initial-place",
    message: "Click Deal to start.",
    round: 0,
    totalRounds,
    drawNum: 0,
    score: 0,
  };
}

/** CPU greedy auto-place: take all 17 cards (5 + 4*3 = 17) and place best to bottom, etc. */
function cpuFullHand(allCards: Card[]): { board: OFCBoard; discarded: Card[] } {
  // Pineapple OFC: each round of 3 you discard 1, 4 draws → 12 cards drawn but only 8 placed → wait that's wrong.
  // Actually: 5 placed initially + 4 rounds × (place 2, discard 1) = 5 + 8 = 13 placed, 4 discarded.
  // Total cards seen = 5 + 4*3 = 17.
  const sorted = [...allCards].sort((a, b) => {
    const av = a.rank === 1 ? 14 : a.rank;
    const bv = b.rank === 1 ? 14 : b.rank;
    return bv - av;
  });
  const place13 = sorted.slice(0, 13);
  const discarded = sorted.slice(13);
  return {
    board: {
      bottom: place13.slice(0, 5),
      middle: place13.slice(5, 10),
      top: place13.slice(10, 13),
    },
    discarded,
  };
}

function dealNew(state: PineappleOfcState): PineappleOfcState {
  const { rng, nextSeed } = nextRng(state.rngSeed);
  const deck = shuffle(newDeck(1), rng);
  // Player: 5 initial cards. CPU gets all 17 at once; we pre-place greedy.
  const playerCardsAll = deck.slice(0, 17);
  const cpuCardsAll = deck.slice(17, 34);
  const cpuPlaced = cpuFullHand(cpuCardsAll);
  return {
    ...state,
    rngSeed: nextSeed,
    deck: deck.slice(34),
    hand: playerCardsAll.slice(0, 5),
    // Stash player's remaining 12 cards in deck-front for streaming
    cardIdx: 0,
    player: { top: [], middle: [], bottom: [] },
    cpu: cpuPlaced.board,
    phase: "initial-place",
    message: "Place your 5 initial cards across top/middle/bottom.",
    round: state.round + 1,
    drawNum: 0,
    // hack: we need future cards available; stash them at front of deck as a simple FIFO
    // Use deck slice 5..17 of player's planned cards as the front of state.deck for next 4 draws.
  };
}

/** Place the current card into a row. Used in initial-place and draw-place phases. */
function placeCard(state: PineappleOfcState, row: OFCRow, indexInHand: number): PineappleOfcState {
  if (indexInHand < 0 || indexInHand >= state.hand.length) return state;
  const card = state.hand[indexInHand]!;
  const max = row === "top" ? 3 : 5;
  if (state.player[row].length >= max) return state;
  const player = { ...state.player, [row]: [...state.player[row], card] };
  const newHand = state.hand.slice();
  newHand.splice(indexInHand, 1);
  const next: PineappleOfcState = { ...state, player, hand: newHand };
  return next;
}

export function reducer(state: PineappleOfcState, action: PineappleOfcAction): PineappleOfcState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "initial-place" && state.phase !== "scored") return state;
    if (state.round >= state.totalRounds) return state;
    if (state.round > 0 && state.phase !== "scored") return state;
    return dealNew(state);
  }
  if (action.type === "place") {
    if (state.phase !== "initial-place" && state.phase !== "draw-place") return state;
    const idx = action.cardIndex ?? 0;
    let s = placeCard(state, action.row, idx);
    if (s === state) return state;
    if (s.phase === "initial-place" && s.hand.length === 0) {
      // Initial 5 placed → start drawing rounds (4 of them)
      s = startDraw(s);
    } else if (s.phase === "draw-place" && s.hand.length === 1) {
      // After placing 2 of 3, 1 left → must discard
      s = { ...s, phase: "discard", message: "Discard 1 card." };
    } else if (s.phase === "draw-place") {
      s = { ...s, message: `Place ${s.hand.length} more, then discard 1.` };
    }
    // Check completion
    if (s.player.top.length === 3 && s.player.middle.length === 5 && s.player.bottom.length === 5) {
      const scoreDelta = scoreBoards(s.player, s.cpu);
      const newScore = s.score + scoreDelta;
      const isLast = s.round >= s.totalRounds;
      return {
        ...s,
        phase: isLast ? "done" : "scored",
        score: newScore,
        message: scoreDelta === 0 ? "Tied round." : scoreDelta > 0 ? `You win round (+${scoreDelta}).` : `CPU wins round (${scoreDelta}).`,
      };
    }
    return s;
  }
  if (action.type === "discard") {
    if (state.phase !== "discard") return state;
    if (action.cardIndex < 0 || action.cardIndex >= state.hand.length) return state;
    const newHand = state.hand.slice();
    newHand.splice(action.cardIndex, 1);
    let s: PineappleOfcState = { ...state, hand: newHand };
    if (s.drawNum >= 4) {
      // Should be done — fall through
      s = { ...s, phase: "draw-place", message: "All draws done." };
    } else {
      s = startDraw(s);
    }
    return s;
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return {
      ...state,
      phase: "initial-place",
      message: "Click Deal to start next round.",
      drawNum: 0,
    };
  }
  return state;
}

function startDraw(state: PineappleOfcState): PineappleOfcState {
  if (state.drawNum >= 4) {
    // No more draws → all done
    return { ...state, phase: "draw-place", hand: [], message: "All cards placed." };
  }
  // Draw 3 cards from deck
  const draw = state.deck.slice(0, 3);
  const deck = state.deck.slice(3);
  return {
    ...state,
    deck,
    hand: draw,
    drawNum: state.drawNum + 1,
    phase: "draw-place",
    message: `Round ${state.drawNum + 1}/4: place 2, discard 1.`,
  };
}

export function isTerminal(state: PineappleOfcState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
