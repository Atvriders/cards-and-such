import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false };

describe("dice-quest", () => {
  it("starts at full HP", () => {
    const s = initialState(1, S);
    expect(s.hp).toBe(10);
    expect(s.round).toBe(1);
  });
  it("forest path rolls 1 die", () => {
    const s = reducer(initialState(2, S), { type: "go", choice: "Forest" });
    expect(s.rolls!.length).toBe(1);
  });
  it("cave path rolls 2 dice", () => {
    const s = reducer(initialState(3, S), { type: "go", choice: "Cave" });
    expect(s.rolls!.length).toBe(2);
  });
  it("mountain path rolls 3 dice", () => {
    const s = reducer(initialState(4, S), { type: "go", choice: "Mountain" });
    expect(s.rolls!.length).toBe(3);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(5, S))).toBeNull();
  });
  it("game ends after TOTAL_ROUNDS or HP=0", () => {
    let s = initialState(6, S);
    for (let i = 0; i < TOTAL_ROUNDS && s.phase !== "done"; i++) {
      s = reducer(s, { type: "go", choice: "Forest" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
