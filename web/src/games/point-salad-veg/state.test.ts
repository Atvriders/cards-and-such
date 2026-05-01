import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, NUM_SUITS } from "./state.js";

const S = { dummy: false };

describe("Point Salad draft", () => {
  it("starts with a full offer and round 1", () => {
    const s = initialState(1, S);
    expect(s.offer.length).toBe(OFFER_SIZE);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("drafting");
  });

  it("pick adds one card to each tableau", () => {
    const s = reducer(initialState(2, S), { type: "pick", idx: 0 });
    expect(s.myTableau.length).toBe(1);
    expect(s.cpuTableau.length).toBe(1);
    expect(["round-done", "done"]).toContain(s.phase);
  });

  it("ignores out-of-range pick", () => {
    const s0 = initialState(3, S);
    const s = reducer(s0, { type: "pick", idx: 99 });
    expect(s).toBe(s0);
  });

  it("ends after TOTAL_ROUNDS picks", () => {
    let s = initialState(4, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2 + 5; i++) {
      if (s.phase === "drafting") s = reducer(s, { type: "pick", idx: 0 });
      else if (s.phase === "round-done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });

  it("tableaux are within suit and rank bounds", () => {
    let s = initialState(5, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2 + 5 && s.phase !== "done"; i++) {
      if (s.phase === "drafting") s = reducer(s, { type: "pick", idx: 0 });
      else if (s.phase === "round-done") s = reducer(s, { type: "next" });
    }
    for (const c of s.myTableau) {
      expect(c.suit).toBeGreaterThanOrEqual(0);
      expect(c.suit).toBeLessThan(NUM_SUITS);
      expect(c.rank).toBeGreaterThanOrEqual(1);
    }
  });
});
