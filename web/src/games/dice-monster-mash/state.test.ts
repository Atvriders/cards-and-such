import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { dummy: false };

describe("dice-monster-mash", () => {
  it("starts at first monster, full HP for all", () => {
    const s = initialState(1, S);
    expect(s.current).toBe(0);
    expect(s.monsters[0]!.hp).toBe(s.monsters[0]!.maxHp);
  });
  it("smash deals damage", () => {
    const s = reducer(initialState(2, S), { type: "smash" });
    expect(s.lastDmg).toBeGreaterThan(0);
    expect(s.monsters[0]!.hp).toBeLessThan(s.monsters[0]!.maxHp);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("eventually clears all monsters", () => {
    let s = initialState(5, S);
    for (let i = 0; i < 200 && s.phase !== "done"; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "smash" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("monster HP never goes below zero", () => {
    let s = initialState(13, S);
    for (let i = 0; i < 30; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "smash" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    s.monsters.forEach(m => expect(m.hp).toBeGreaterThanOrEqual(0));
  });
});
