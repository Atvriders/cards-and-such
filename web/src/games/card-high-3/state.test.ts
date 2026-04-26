import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s0 = () => initialState(42, { rounds: "10" });

describe("CardHigh3", () => {
  it("starts in dealing phase with score 0", () => {
    const s = s0();
    expect(s.phase).toBe("dealing");
    expect(s.score).toBe(0);
    expect(s.hand).toBeNull();
  });

  it("deal reveals a hand of 3 cards", () => {
    const s = s0();
    const s2 = reducer(s, { type: "deal" });
    expect(s2.hand?.length).toBe(3);
    expect(s2.lastSum).not.toBeNull();
  });

  it("high sum earns points", () => {
    // Find a seed where sum >= 24
    let found = false;
    for (let seed = 1; seed <= 50; seed++) {
      const s = initialState(seed, { rounds: "10" });
      const s2 = reducer(s, { type: "deal" });
      if ((s2.lastSum ?? 0) >= 24) {
        expect(s2.score).toBeGreaterThanOrEqual(10);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("isTerminal returns score after all rounds", () => {
    let s = s0();
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("gameover");
    expect(isTerminal(s)?.score).toBeDefined();
  });
});
