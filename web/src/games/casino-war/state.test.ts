import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CasinoWarState } from "./state.js";

const defaultSettings = { startingBankroll: 1000, anteSize: "25" as const, handsPerSession: 10 };

describe("initialState", () => {
  it("starts with correct bankroll and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });

  it("shoe has 312 cards (6 decks)", () => {
    const s = initialState(42, defaultSettings);
    expect(s.shoe).toHaveLength(312);
  });
});

describe("deal action — win/lose resolution", () => {
  it("eventually produces a win or loss result", () => {
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      if (s2.phase === "settled" && s2.lastResult.includes("Win")) {
        expect(s2.bankroll).toBe(1000 + 25);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("loss deducts ante", () => {
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      if (s2.phase === "settled" && s2.lastResult.includes("Lose")) {
        expect(s2.bankroll).toBe(1000 - 25);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("tie leads to tie-decision phase", () => {
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      if (s2.phase === "tie-decision") {
        expect(s2.playerCard).not.toBeNull();
        expect(s2.dealerCard).not.toBeNull();
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("cannot deal without enough bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: CasinoWarState = { ...s, bankroll: 10 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("betting");
  });
});

describe("tie-decision actions", () => {
  function getTieState(): CasinoWarState | null {
    for (let seed = 0; seed < 1000; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "deal" });
      if (s2.phase === "tie-decision") return s2;
    }
    return null;
  }

  it("surrender returns half ante", () => {
    const tieState = getTieState();
    expect(tieState).not.toBeNull();
    if (!tieState) return;
    const bankrollBeforeTie = tieState.bankroll; // ante already deducted
    const s3 = reducer(tieState, { type: "surrender" });
    expect(s3.phase).toBe("settled");
    expect(s3.bankroll).toBe(bankrollBeforeTie + 12); // Math.floor(25/2) = 12 returned
    expect(s3.lastResult).toContain("Surrender");
  });

  it("go-to-war deals final cards and resolves", () => {
    const tieState = getTieState();
    expect(tieState).not.toBeNull();
    if (!tieState) return;
    const s3 = reducer(tieState, { type: "go-to-war" });
    expect(s3.phase).toBe("settled");
    expect(s3.playerFinal).not.toBeNull();
    expect(s3.dealerFinal).not.toBeNull();
    expect(s3.handsPlayed).toBe(1);
    expect(s3.bankroll).toBeGreaterThanOrEqual(0);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when hands exhausted", () => {
    const s = initialState(42, defaultSettings);
    const done: CasinoWarState = { ...s, phase: "settled", handsPlayed: 10, bankroll: 900 };
    expect(isTerminal(done)).toEqual({ score: 900 });
  });

  it("terminal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: CasinoWarState = { ...s, phase: "settled", bankroll: 0, handsPlayed: 3 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal in tie-decision phase", () => {
    const s = initialState(42, defaultSettings);
    const tiePhase: CasinoWarState = { ...s, phase: "tie-decision" };
    expect(isTerminal(tiePhase)).toBeNull();
  });
});
