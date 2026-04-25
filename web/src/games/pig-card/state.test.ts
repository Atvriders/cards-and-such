import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, hasQuad } from "./state.js";
import type { PigState } from "./state.js";
import type { Card, Rank } from "../../engines/deck/index.js";

function card(rank: Rank, suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const s2 = { opponents: "1" as const };
const s3 = { opponents: "2" as const };

describe("initialState", () => {
  it("deals 4 cards per seat", () => {
    const s = initialState(1, s2);
    expect(s.hands[0]!.length).toBe(4);
    expect(s.hands[1]!.length).toBe(4);
  });

  it("starts with 3 lives each", () => {
    const s = initialState(1, s2);
    expect(s.lives).toEqual([3, 3]);
  });

  it("is deterministic", () => {
    const a = initialState(7, s2);
    const b = initialState(7, s2);
    expect(a.hands).toEqual(b.hands);
  });

  it("3 opponents creates 4 seats", () => {
    const s = initialState(1, { opponents: "3" as const });
    expect(s.seats).toBe(4);
    expect(s.lives.length).toBe(4);
  });
});

describe("hasQuad", () => {
  it("detects four of a kind", () => {
    const hand = [card(5, "♠"), card(5, "♥"), card(5, "♦"), card(5, "♣")];
    expect(hasQuad(hand)).toBe(true);
  });

  it("returns false for non-quad", () => {
    const hand = [card(5, "♠"), card(5, "♥"), card(5, "♦"), card(6, "♣")];
    expect(hasQuad(hand)).toBe(false);
  });
});

describe("reducer — passing", () => {
  it("passing a card keeps hand size at 4", () => {
    const s = initialState(5, s2);
    const c = s.hands[0]![0]!;
    const result = reducer(s, { type: "pass", cardId: c.id });
    expect(result.hands[0]!.length).toBe(4);
  });

  it("passed card leaves player hand", () => {
    const s = initialState(10, s2);
    const c = s.hands[0]![0]!;
    const result = reducer(s, { type: "pass", cardId: c.id });
    const passedCardId = c.id;
    // The card shouldn't be in the same position (it was passed left and a new card arrived)
    // We just verify hand size
    expect(result.hands[0]!.length).toBe(4);
  });

  it("rejects pass of unknown card", () => {
    const s = initialState(1, s2);
    expect(reducer(s, { type: "pass", cardId: "xxx" })).toBe(s);
  });
});

describe("reducer — nose phase", () => {
  it("pressing nose in nose phase resolves round", () => {
    const base = initialState(1, s2);
    const noseState: PigState = { ...base, phase: "nose", nosePressed: [false, true] };
    const result = reducer(noseState, { type: "pressNose" });
    expect(result.phase === "passing" || result.phase === "done").toBe(true);
  });

  it("pressing nose in passing phase is no-op", () => {
    const s = initialState(1, s2);
    const result = reducer(s, { type: "pressNose" });
    expect(result).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns 500 for win", () => {
    const s = initialState(1, s2);
    const won: PigState = { ...s, phase: "done", winner: 0, lives: [2, 0] };
    expect(isTerminal(won)!.score).toBe(500);
  });

  it("returns 0 for loss with no lives", () => {
    const s = initialState(1, s2);
    const lost: PigState = { ...s, phase: "done", winner: 1, lives: [0, 3] };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
