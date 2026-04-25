import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { startScore: "10" as const };

describe("DoubleOrNothingDice initialState", () => {
  it("starts in rolling phase", () => {
    expect(initialState(1, def).phase).toBe("rolling");
  });

  it("score matches settings", () => {
    expect(initialState(1, def).score).toBe(10);
    expect(initialState(1, { startScore: "50" }).score).toBe(50);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, def);
    const s2 = initialState(42, def);
    expect(s1.score).toBe(s2.score);
  });

  it("starts with zero banked", () => {
    expect(initialState(1, def).banked).toBe(0);
  });
});

describe("DoubleOrNothingDice reducer", () => {
  it("roll changes phase to result or bust", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "roll" });
    expect(["result", "bust"]).toContain(s2.phase);
  });

  it("bank after roll saves score", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase === "result") {
      const s3 = reducer(s2, { type: "bank" });
      expect(s3.phase).toBe("banked");
      expect(s3.banked).toBe(s2.score);
    }
  });

  it("cannot bank before first roll", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "bank" });
    expect(s2.phase).toBe("rolling");
  });

  it("doubles doubles the score", () => {
    // Try seeds until we get doubles on first roll
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, def);
      const s2 = reducer(s, { type: "roll" });
      if (s2.lastDoubles && s2.phase !== "bust") {
        expect(s2.score).toBe(s.score * 2);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});

describe("DoubleOrNothingDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when banked", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase === "result") {
      const s3 = reducer(s2, { type: "bank" });
      expect(isTerminal(s3)).not.toBeNull();
    }
  });
});
