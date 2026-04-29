import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, cardName } from "./state.js";
const S = { dummy: false };
describe("Flush (Indian Poker)", () => {
  it("starts in ready phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("ready");
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });
  it("play deals cards and resolves", () => {
    const s = reducer(initialState(1, S), { type: "play" });
    expect(["scored", "done"]).toContain(s.phase);
    expect(s.cardA).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("next advances round", () => {
    let s = reducer(initialState(2, S), { type: "play" });
    if (s.phase === "scored") {
      s = reducer(s, { type: "next" });
      expect(s.round).toBeGreaterThanOrEqual(2);
      expect(s.phase).toBe("ready");
    }
  });
  it("game ends after TOTAL_ROUNDS plays", () => {
    let s = initialState(7, S);
    let safety = 0;
    while (s.phase !== "done" && safety++ < TOTAL_ROUNDS * 3) {
      if (s.phase === "ready") s = reducer(s, { type: "play" });
      else if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("cardName returns rank+suit string", () => {
    expect(cardName(0).length).toBeGreaterThanOrEqual(2);
  });
});
