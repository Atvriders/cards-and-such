import { describe, expect, it } from "vitest";
import {
  dealHands, drawFromPile, playCard, advanceTurn, reverseDirection, top, recycleDiscard,
} from "./index.js";
import type { HandState, ShedCard } from "./types.js";

function card(id: string, data: Record<string, unknown> = {}): ShedCard {
  return { id, data };
}

function baseState(seats = 4): HandState {
  return {
    hands: Array.from({ length: seats }, () => []),
    drawPile: [],
    discardPile: [],
    turn: 0,
    direction: 1,
    seats,
  };
}

describe("dealHands", () => {
  it("distributes cards round-robin", () => {
    const deck = [card("a"), card("b"), card("c"), card("d"), card("e"), card("f"), card("g")];
    const { hands, remaining } = dealHands(deck, 3, 2);
    expect(hands[0]!.map((c) => c.id)).toEqual(["a", "d"]);
    expect(hands[1]!.map((c) => c.id)).toEqual(["b", "e"]);
    expect(hands[2]!.map((c) => c.id)).toEqual(["c", "f"]);
    expect(remaining.map((c) => c.id)).toEqual(["g"]);
  });
});

describe("drawFromPile", () => {
  it("moves top-N draw pile cards into the seat's hand", () => {
    const s: HandState = { ...baseState(), drawPile: [card("x"), card("y"), card("z")] };
    const next = drawFromPile(s, 1, 2);
    expect(next.hands[1]!.map((c) => c.id)).toEqual(["x", "y"]);
    expect(next.drawPile.map((c) => c.id)).toEqual(["z"]);
  });
});

describe("playCard", () => {
  it("moves a card from hand to discard top", () => {
    const s: HandState = { ...baseState(), hands: [[card("a"), card("b")], []] };
    const next = playCard(s, 0, "a");
    expect(next.hands[0]!.map((c) => c.id)).toEqual(["b"]);
    expect(top(next)?.id).toBe("a");
  });
  it("returns state unchanged if card not in hand", () => {
    const s: HandState = { ...baseState(), hands: [[card("a")], []] };
    const next = playCard(s, 0, "z");
    expect(next).toBe(s);
  });
});

describe("advanceTurn", () => {
  it("advances by 1 clockwise", () => {
    const s = baseState(4);
    expect(advanceTurn(s).turn).toBe(1);
  });
  it("skips one seat with skip=1", () => {
    const s = baseState(4);
    expect(advanceTurn(s, 1).turn).toBe(2);
  });
  it("wraps counter-clockwise", () => {
    const s: HandState = { ...baseState(4), turn: 0, direction: -1 };
    expect(advanceTurn(s).turn).toBe(3);
  });
});

describe("reverseDirection", () => {
  it("flips 1 to -1 and back", () => {
    const s = baseState();
    const r = reverseDirection(s);
    expect(r.direction).toBe(-1);
    expect(reverseDirection(r).direction).toBe(1);
  });
});

describe("recycleDiscard", () => {
  it("leaves top card on discard and hands the rest back to shuffle", () => {
    const s: HandState = { ...baseState(), discardPile: [card("a"), card("b"), card("c")] };
    const r = recycleDiscard(s);
    expect(r.state.discardPile.map((c) => c.id)).toEqual(["c"]);
    expect(r.toShuffle.map((c) => c.id)).toEqual(["a", "b"]);
  });
  it("no-op when discard has 1 or 0 cards", () => {
    const s: HandState = { ...baseState(), discardPile: [card("a")] };
    const r = recycleDiscard(s);
    expect(r.state).toBe(s);
    expect(r.toShuffle).toEqual([]);
  });
});
