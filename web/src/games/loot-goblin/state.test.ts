import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Loot Goblin", () => {
  it("initializes correctly", () => {
    const s = initialState(1);
    expect(s.gold).toBe(0);
    expect(s.heldGold).toBe(0);
    expect(s.trapTokens).toBe(0);
    expect(s.phase).toBe("choose");
    expect(s.currentRoom).toBe(0);
  });

  it("entering room transitions to rolled phase", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "enterRoom" });
    expect(["rolled", "dead", "done"]).toContain(s2.phase);
    if (s2.phase === "rolled") {
      expect(s2.heldGold).toBeGreaterThan(0);
      expect(s2.lastDice).not.toBeNull();
    }
  });

  it("banking escapes and banks gold", () => {
    const s = { ...initialState(1), phase: "rolled" as const, heldGold: 25, gold: 10 };
    const s2 = reducer(s, { type: "bankAndEscape" });
    expect(s2.phase).toBe("done");
    expect(s2.gold).toBe(35);
  });

  it("pressing on returns to choose phase", () => {
    const s = { ...initialState(1), phase: "rolled" as const, currentRoom: 1 };
    const s2 = reducer(s, { type: "pressOn" });
    expect(s2.phase).toBe("choose");
  });

  it("3 trap tokens causes dead phase", () => {
    const s = { ...initialState(1), phase: "choose" as const, trapTokens: 2, currentRoom: 9 };
    // Room 10 has 5 trap dice, very high chance of triggering at least 1
    // Run multiple seeds to find one that triggers
    let found = false;
    for (let seed = 0; seed < 50; seed++) {
      const st = { ...initialState(seed), phase: "choose" as const, trapTokens: 2, currentRoom: 9 };
      const st2 = reducer(st, { type: "enterRoom" });
      if (st2.phase === "dead") { found = true; break; }
    }
    expect(found).toBe(true);
    void s;
  });

  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = { ...initialState(1), phase: "done" as const, gold: 100 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns score when dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, gold: 50 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(25);
  });
});
