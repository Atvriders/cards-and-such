import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pointsOf, DECK, TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false };

describe("HachiHachi", () => {
  it("48-card deck", () => { expect(DECK.length).toBe(48); });

  it("starts in choose phase round 1", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("choose");
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
    expect(s.hand.length).toBe(2);
    expect(s.field.length).toBe(2);
  });

  it("playing a card advances state", () => {
    const s = initialState(2, S);
    const next = reducer(s, { type: "play", cardId: s.hand[0]! });
    expect(next.score).toBeGreaterThanOrEqual(s.score);
    expect(["result", "done"]).toContain(next.phase);
  });

  it("invalid card is ignored", () => {
    const s = initialState(3, S);
    expect(reducer(s, { type: "play", cardId: 999 })).toEqual(s);
  });

  it("pointsOf hierarchy", () => {
    expect(pointsOf("hikari")).toBe(20);
    expect(pointsOf("tane")).toBe(10);
    expect(pointsOf("tan")).toBe(5);
    expect(pointsOf("kasu")).toBe(1);
  });

  it("eventually terminates", () => {
    let s = initialState(7, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2 + 5; i++) {
      if (s.phase === "choose") s = reducer(s, { type: "play", cardId: s.hand[0]! });
      else if (s.phase === "result") s = reducer(s, { type: "next" });
      else break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
