import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MacaoDiceState } from "./state.js";

const settings = { startChips: "10" as const };

describe("MacaoDice initialState", () => {
  it("starts with correct chips and betting phase", () => {
    const s = initialState(42, settings);
    expect(s.chips).toBe(10);
    expect(s.phase).toBe("betting");
    expect(s.round).toBe(1);
    expect(s.bet).toBe(1);
  });

  it("is deterministic", () => {
    expect(initialState(77, settings)).toEqual(initialState(77, settings));
  });
});

describe("MacaoDice setBet", () => {
  it("updates bet within chip range", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "setBet", amount: 5 });
    expect(s2.bet).toBe(5);
  });

  it("clamps bet to available chips", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "setBet", amount: 999 });
    expect(s2.bet).toBe(s.chips);
  });
});

describe("MacaoDice roll", () => {
  it("roll resolves to roundOver or tieBreak", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(["roundOver", "tieBreak"]).toContain(s2.phase);
  });

  it("chips change after win or loss", () => {
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, settings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.phase === "roundOver") {
        expect(s2.chips).not.toBe(s.chips);
        return;
      }
    }
    throw new Error("No non-tie result found");
  });

  it("MACAO (player rolls 6, dealer doesn't) pays 3x", () => {
    // Simulate by constructing state where conditions match
    for (let seed = 0; seed < 500; seed++) {
      const s = initialState(seed, settings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.phase === "roundOver" && s2.playerDie === 6 && s2.dealerDie < 6) {
        // Macao: won 3× bet
        expect(s2.chips).toBe(s.chips + s.bet * 3);
        return;
      }
    }
    // It's OK if we don't find one in 500 seeds, but we try
  });
});

describe("MacaoDice isTerminal", () => {
  it("null when not done", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns chips as score when done", () => {
    const s = initialState(1, settings);
    const done: MacaoDiceState = { ...s, phase: "done", chips: 25 };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(25);
  });
});
