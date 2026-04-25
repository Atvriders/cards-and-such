import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SpoonsState } from "./state.js";
import type { Card, Rank } from "../../engines/deck/index.js";

function card(rank: Rank, suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const s2 = { opponents: "1" as const };
const s3 = { opponents: "2" as const };

describe("initialState", () => {
  it("deals 4 cards to each seat", () => {
    const s = initialState(1, s2);
    expect(s.hands[0]!.length).toBe(4);
    expect(s.hands[1]!.length).toBe(4);
  });

  it("starts with seats-1 spoons", () => {
    const s = initialState(1, s3);
    expect(s.spoons).toBe(2);
    expect(s.seats).toBe(3);
  });

  it("starts each player with 3 lives", () => {
    const s = initialState(42, s2);
    expect(s.lives).toEqual([3, 3]);
  });

  it("is deterministic", () => {
    const a = initialState(7, s2);
    const b = initialState(7, s2);
    expect(a.hands).toEqual(b.hands);
  });
});

describe("reducer — passing", () => {
  it("passing a card changes hand sizes back to 4", () => {
    const s = initialState(5, s2);
    const cardToPass = s.hands[0]![0]!;
    const s2s = reducer(s, { type: "pass", cardId: cardToPass.id });
    expect(s2s.hands[0]!.length).toBe(4);
  });

  it("passed card is no longer in player hand", () => {
    const s = initialState(10, s2);
    const cardToPass = s.hands[0]![0]!;
    const s2s = reducer(s, { type: "pass", cardId: cardToPass.id });
    expect(s2s.hands[0]!.find(c => c.id === cardToPass.id && c.suit === cardToPass.suit)).toBeUndefined();
  });

  it("rejects pass of card not in hand", () => {
    const s = initialState(3, s2);
    const s2s = reducer(s, { type: "pass", cardId: "bogus" });
    expect(s2s).toBe(s);
  });
});

describe("reducer — grab phase", () => {
  it("player grabs spoon when one is available", () => {
    const base = initialState(42, s2);
    const grabState: SpoonsState = {
      ...base,
      phase: "grab",
      spoons: 1,
      spoonsGrabbed: 0,
    };
    const result = reducer(grabState, { type: "grab" });
    // Should advance to new round or done
    expect(result.phase === "passing" || result.phase === "done").toBe(true);
  });

  it("player loses a life when no spoons available", () => {
    const base = initialState(42, s2);
    const grabState: SpoonsState = {
      ...base,
      phase: "grab",
      spoons: 0,
      spoonsGrabbed: 1,
      lives: [3, 3],
    };
    const result = reducer(grabState, { type: "grab" });
    expect(result.lives[0]! < 3 || result.phase === "done").toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns positive score for player win", () => {
    const s = initialState(1, s2);
    const won: SpoonsState = { ...s, phase: "done", winner: 0, lives: [3, 0] };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("returns low score for player loss", () => {
    const s = initialState(1, s2);
    const lost: SpoonsState = { ...s, phase: "done", winner: 1, lives: [0, 3] };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
