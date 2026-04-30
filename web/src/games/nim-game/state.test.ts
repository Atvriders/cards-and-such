import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, START_STICKS } from "./state.js";

const S = { dummy: false };

describe("nim-game", () => {
  it("starts with 21 sticks, player turn, playing phase", () => {
    const s = initialState(1, S);
    expect(s.sticks).toBe(START_STICKS);
    expect(s.turn).toBe("P");
    expect(s.phase).toBe("playing");
    expect(s.lastTake).toBeNull();
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("take 1 removes 1 plus the CPU's optimal response", () => {
    const s = reducer(initialState(1, S), { type: "take", n: 1 });
    // After player's 1, 20 remain; CPU plays toward 17 or random.
    expect(s.sticks).toBeLessThanOrEqual(START_STICKS - 1);
    expect(s.sticks).toBeGreaterThanOrEqual(START_STICKS - 4);
    expect(s.lastTake?.who).toBe("C");
  });
  it("invalid take amounts are clamped or rejected", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "take", n: 99 });
    // n>3 is clamped to 3, so a move occurs.
    expect(s1.sticks).toBeLessThan(START_STICKS);
  });
  it("player taking the last stick loses (misère)", () => {
    // Drive to 1 stick by mocking state.
    const s: ReturnType<typeof initialState> = { ...initialState(1, S), sticks: 1 };
    const s2 = reducer(s, { type: "take", n: 1 });
    expect(s2.phase).toBe("done");
    expect(s2.result).toBe("C");
    expect(s2.score).toBe(0);
  });
  it("reset returns to fresh start", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "take", n: 2 });
    const s2 = reducer(s1, { type: "reset" });
    expect(s2.sticks).toBe(START_STICKS);
    expect(s2.phase).toBe("playing");
    expect(s2.lastTake).toBeNull();
  });
});
