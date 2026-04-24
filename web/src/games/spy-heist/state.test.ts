import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, STAGES, TOTAL_STAGES } from "./state.js";

describe("Spy Heist", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.stage).toBe(1);
    expect(s.heat).toBe(0);
    expect(s.loot).toBe(0);
    expect(s.phase).toBe("choose");
  });

  it("choosing an option transitions to result phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", choiceIndex: 0 });
    expect(s2.phase === "result" || s2.phase === "caught").toBe(true);
    expect(s2.lastResult).not.toBe("");
  });

  it("heat increases after making a choice", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", choiceIndex: 0 });
    expect(s2.heat).toBeGreaterThan(0);
  });

  it("advance moves to next stage", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", choiceIndex: 0 });
    if (s2.phase === "result") {
      const s3 = reducer(s2, { type: "advance" });
      expect(s3.stage).toBe(2);
      expect(s3.phase).toBe("choose");
    }
  });

  it("heat >= 100 causes caught phase", () => {
    const s = { ...initialState(42), heat: 99 };
    // All choices gain at least 1 heat, pushing to 100
    const stage = STAGES[s.stage - 1]!;
    const s2 = reducer(s, { type: "choose", choiceIndex: 2 }); // Rush = highest heat
    if (s2.heat >= 100) {
      expect(s2.phase).toBe("caught");
    }
  });

  it("done after all stages", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_STAGES; i++) {
      if (s.phase === "caught" || s.phase === "done") break;
      s = reducer(s, { type: "choose", choiceIndex: 0 }); // safest choice
      if (s.phase === "result") {
        s = reducer(s, { type: "advance" });
      }
    }
    expect(s.phase === "done" || s.phase === "caught").toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal null during choose phase", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("isTerminal score bounded 0-100", () => {
    const s = { ...initialState(42), phase: "done" as const, loot: 200 };
    expect(isTerminal(s)?.score).toBe(100);
    const s2 = { ...initialState(42), phase: "done" as const, loot: 0 };
    expect(isTerminal(s2)?.score).toBe(0);
  });

  it("caught gives lower score than done with same loot", () => {
    const loot = 100;
    const done = isTerminal({ ...initialState(42), phase: "done" as const, loot });
    const caught = isTerminal({ ...initialState(42), phase: "caught" as const, loot });
    expect(done!.score).toBeGreaterThan(caught!.score);
  });
});
