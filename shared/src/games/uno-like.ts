import { z } from "zod";
import type { Seat } from "../rooms.js";

export type UnoColor = "red" | "yellow" | "green" | "blue";
export type UnoCardType =
  | { kind: "number"; color: UnoColor; value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { kind: "skip"; color: UnoColor }
  | { kind: "reverse"; color: UnoColor }
  | { kind: "draw-2"; color: UnoColor }
  | { kind: "wild" }
  | { kind: "wild-draw-4" };

export interface UnoCard { id: string; card: UnoCardType }

export interface UnoLikeState {
  hands: readonly UnoCard[][];        // one per seat
  drawPile: readonly UnoCard[];
  discardTop: UnoCard;                 // top of discard, always present
  activeColor: UnoColor;               // effective color (wilds set this)
  seats: number;                       // 2..4
  turn: number;                        // 0..seats-1
  direction: 1 | -1;
  pendingDraws: number;                // stacked from draw-2 / wild-draw-4
  winner: number | null;               // seat or null
  rngSeed: number;                     // advanced each draw
}

export type UnoLikeAction =
  | { type: "play"; cardId: string; chosenColor?: UnoColor }
  | { type: "draw" }
  | { type: "pass" };

export const UnoLikeActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("play"), cardId: z.string(), chosenColor: z.enum(["red","yellow","green","blue"]).optional() }),
  z.object({ type: z.literal("draw") }),
  z.object({ type: z.literal("pass") }),
]);

const COLORS: readonly UnoColor[] = ["red", "yellow", "green", "blue"];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(cards: readonly T[], rng: () => number): T[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

function fullDeck(): UnoCard[] {
  const out: UnoCard[] = [];
  let idx = 0;
  for (const color of COLORS) {
    out.push({ id: `${color}-0-${idx++}`, card: { kind: "number", color, value: 0 } });
    for (let v = 1; v <= 9; v++) {
      for (let copy = 0; copy < 2; copy++) {
        out.push({ id: `${color}-${v}-${copy}-${idx++}`, card: { kind: "number", color, value: v as 0|1|2|3|4|5|6|7|8|9 } });
      }
    }
    for (let copy = 0; copy < 2; copy++) {
      out.push({ id: `${color}-skip-${copy}-${idx++}`, card: { kind: "skip", color } });
      out.push({ id: `${color}-reverse-${copy}-${idx++}`, card: { kind: "reverse", color } });
      out.push({ id: `${color}-draw2-${copy}-${idx++}`, card: { kind: "draw-2", color } });
    }
  }
  for (let i = 0; i < 4; i++) out.push({ id: `wild-${i}-${idx++}`, card: { kind: "wild" } });
  for (let i = 0; i < 4; i++) out.push({ id: `wild4-${i}-${idx++}`, card: { kind: "wild-draw-4" } });
  return out;
}

export function unoInitial(seed: number, seats: number): UnoLikeState {
  const s = Math.max(2, Math.min(4, seats));
  const rng = mulberry32(seed);
  const deck = shuffle(fullDeck(), rng);
  const hands: UnoCard[][] = Array.from({ length: s }, () => []);
  let i = 0;
  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < s; p++) hands[p]!.push(deck[i++]!);
  }
  // Flip a starting card, but not a wild-draw-4; if it's a wild, set activeColor arbitrarily.
  let topIdx = i;
  while (deck[topIdx]?.card.kind === "wild-draw-4") topIdx++;
  const topCard = deck[topIdx]!;
  const remainder = deck.slice(i).filter((_, j) => i + j !== topIdx);
  let activeColor: UnoColor = "red";
  if (topCard.card.kind === "wild") activeColor = "red";
  else if ("color" in topCard.card) activeColor = topCard.card.color;
  return {
    hands,
    drawPile: remainder,
    discardTop: topCard,
    activeColor,
    seats: s,
    turn: 0,
    direction: 1,
    pendingDraws: 0,
    winner: null,
    rngSeed: Math.floor(rng() * 2 ** 31),
  };
}

function canPlay(card: UnoCard, state: UnoLikeState): boolean {
  const c = card.card;
  const top = state.discardTop.card;
  if (c.kind === "wild" || c.kind === "wild-draw-4") {
    // pendingDraws: wild-draw-4 can chain on wild-draw-4; wild cannot.
    if (state.pendingDraws > 0) {
      if (top.kind === "wild-draw-4" && c.kind === "wild-draw-4") return true;
      return false;
    }
    return true;
  }
  // pendingDraws: must chain with draw-2 if top was draw-2.
  if (state.pendingDraws > 0) {
    if (top.kind === "draw-2" && c.kind === "draw-2") return true;
    return false;
  }
  if ("color" in c && c.color === state.activeColor) return true;
  if (top.kind === "number" && c.kind === "number" && c.value === top.value) return true;
  if (top.kind === c.kind && c.kind !== "number") return true;
  return false;
}

function nextSeat(state: UnoLikeState, skip = 0): number {
  const step = (1 + skip) * state.direction;
  return ((state.turn + step) % state.seats + state.seats) % state.seats;
}

function drawFrom(state: UnoLikeState, seat: number, n: number): UnoLikeState {
  const rng = mulberry32(state.rngSeed);
  let drawPile = state.drawPile.slice();
  const drawn: UnoCard[] = [];
  for (let i = 0; i < n; i++) {
    if (drawPile.length === 0) break;
    drawn.push(drawPile[0]!);
    drawPile = drawPile.slice(1);
  }
  const hands = state.hands.map((h, i) => (i === seat ? [...h, ...drawn] : [...h]));
  return { ...state, drawPile, hands, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function unoReduce(state: UnoLikeState, action: UnoLikeAction, seat: Seat): UnoLikeState {
  if (state.winner !== null) return state;
  if (seat !== state.turn) return state;

  if (action.type === "draw") {
    // If pendingDraws, absorb them and skip turn.
    if (state.pendingDraws > 0) {
      const drawn = drawFrom(state, seat, state.pendingDraws);
      return { ...drawn, pendingDraws: 0, turn: nextSeat(drawn) };
    }
    // Otherwise draw 1. Player may then pass or play the drawn if legal (handled by UI/bot).
    return drawFrom(state, seat, 1);
  }

  if (action.type === "pass") {
    // Only valid when the player has just drawn and chooses not to play. Simply advance turn.
    return { ...state, turn: nextSeat(state) };
  }

  // type === "play"
  const hand = state.hands[seat]!;
  const idx = hand.findIndex((c) => c.id === action.cardId);
  if (idx < 0) return state;
  const card = hand[idx]!;
  if (!canPlay(card, state)) return state;

  const newHand = [...hand.slice(0, idx), ...hand.slice(idx + 1)];
  const newHands = state.hands.map((h, i) => (i === seat ? newHand : h));

  let next: UnoLikeState = {
    ...state,
    hands: newHands,
    discardTop: card,
    pendingDraws: 0, // reset then re-set below if draw-2/wild-draw-4
  };

  // Set active color
  let activeColor: UnoColor = "red";
  const c = card.card;
  if (c.kind === "wild" || c.kind === "wild-draw-4") {
    activeColor = action.chosenColor ?? "red";
  } else {
    activeColor = c.color;
  }
  next = { ...next, activeColor };

  // Handle action cards
  let skip = 0;
  if (c.kind === "skip") skip = 1;
  if (c.kind === "reverse") {
    next = { ...next, direction: (next.direction === 1 ? -1 : 1) as 1 | -1 };
    if (next.seats === 2) skip = 1; // reverse acts as skip in 2-player
  }
  if (c.kind === "draw-2") next = { ...next, pendingDraws: (state.pendingDraws || 0) + 2 };
  if (c.kind === "wild-draw-4") next = { ...next, pendingDraws: (state.pendingDraws || 0) + 4 };

  if (newHand.length === 0) {
    return { ...next, winner: seat };
  }

  return { ...next, turn: nextSeat(next, skip) };
}

export function unoTerminal(state: UnoLikeState): { winner: Seat | "draw"; score: number } | null {
  if (state.winner === null) return null;
  const winnerSeat = Math.max(0, Math.min(3, state.winner)) as Seat;
  // Score: for online, winner gets 100; losers get 0 (plugin computes own score for SP).
  return { winner: winnerSeat, score: 100 };
}
