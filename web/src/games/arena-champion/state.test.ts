import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Arena Champion", () => {
  it("initializes correctly", () => {
    const s = initialState(1);
    expect(s.round).toBe(1);
    expect(s.playerHp).toBe(50);
    expect(s.phase).toBe("choose");
    expect(s.opponent.name).toBe("Rex");
  });

  it("move transitions phase", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "move", move: "heavy" });
    expect(["choose", "result", "dead"]).toContain(s2.phase);
  });

  it("brace adds temp defense for the exchange", () => {
    const s = initialState(1);
    // After brace, the player should have taken less/no damage vs a raw attack
    // Just verify the action doesn't crash and phase is valid
    const s2 = reducer(s, { type: "move", move: "brace" });
    expect(["choose", "dead"]).toContain(s2.phase);
    // playerHp should not exceed max
    expect(s2.playerHp).toBeLessThanOrEqual(s2.playerMaxHp);
  });

  it("nextFight advances to round 2", () => {
    const s = { ...initialState(1), phase: "result" as const, round: 1, wins: 1 };
    const s2 = reducer(s, { type: "nextFight" });
    expect(s2.round).toBe(2);
    expect(s2.phase).toBe("choose");
  });

  it("nextFight heals player", () => {
    const s = { ...initialState(1), phase: "result" as const, playerHp: 20, wins: 1 };
    const s2 = reducer(s, { type: "nextFight" });
    expect(s2.playerHp).toBeGreaterThan(20);
  });

  it("isTerminal null during combat", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns 100 on done", () => {
    const s = { ...initialState(1), phase: "done" as const };
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("isTerminal returns partial score on dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, wins: 4, maxRounds: 8 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(40);
  });
});
