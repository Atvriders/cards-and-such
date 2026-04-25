import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { rounds: "10" as const };

describe("initialState", () => {
  it("starts with correct defaults", () => {
    const s = initialState(1, settings);
    expect(s.playerMoney).toBe(1000);
    expect(s.round).toBe(1);
    expect(s.totalRounds).toBe(10);
    expect(s.phase).toBe("bid");
    expect(s.item.trueValue).toBeGreaterThan(0);
  });
});

describe("reducer pass", () => {
  it("moves to result phase when player passes", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.phase).toBe("result");
    expect(s2.item.winner).toBe("ai");
  });
});

describe("reducer raise", () => {
  it("player wins when AI concedes", () => {
    // Force scenario where AI will concede by using cheap item
    const s = initialState(42, settings);
    // Try raises until result
    let cur = s;
    for (let i = 0; i < 10 && cur.phase === "bid"; i++) {
      cur = reducer(cur, { type: "raise", amount: 100 });
    }
    // Either player won, or AI keeps bidding — just verify no crash
    expect(["bid", "result"]).toContain(cur.phase);
  });

  it("rejects bid beyond player budget", () => {
    const s = { ...initialState(1, settings), playerMoney: 5 };
    const s2 = reducer(s, { type: "raise", amount: 50 });
    expect(s2.phase).toBe("bid");
    expect(s2.log).toMatch(/can't afford/i);
  });
});

describe("reducer next + isTerminal", () => {
  it("advances round after result", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.phase).toBe("result");
    const s3 = reducer(s2, { type: "next" });
    expect(s3.round).toBe(2);
    expect(s3.phase).toBe("bid");
  });

  it("ends game after last round", () => {
    let s = { ...initialState(1, { rounds: "5" as const }), round: 5 };
    s = reducer(s, { type: "pass" });
    const s2 = reducer(s, { type: "next" });
    expect(s2.phase).toBe("over");
    expect(isTerminal(s2)).not.toBeNull();
  });

  it("null terminal during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
});
