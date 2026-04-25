import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("phrazle", () => {
  it("initialState picks a phrase", () => {
    const s = initialState(42);
    expect(s.target.length).toBeGreaterThan(5);
    expect(s.attempts).toHaveLength(0);
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
  });

  it("letter action adds char and auto-inserts spaces", () => {
    const s = initialState(1);
    // Fill a few letters
    let cur = s;
    cur = reducer(cur, { type: "letter", char: "A" });
    expect(cur.current.length).toBeGreaterThanOrEqual(1);
    expect(cur.error).toBeNull();
  });

  it("backspace removes last letter", () => {
    let s = initialState(2);
    s = reducer(s, { type: "letter", char: "B" });
    s = reducer(s, { type: "backspace" });
    expect(s.current).toBe("");
  });

  it("submit on short phrase returns error", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.error).toBeTruthy();
  });

  it("winning increments score", () => {
    let s = initialState(10);
    // Spell out the target exactly
    for (const ch of s.target) {
      if (ch === " ") continue;
      s = reducer(s, { type: "letter", char: ch });
    }
    s = reducer(s, { type: "submit" });
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBeGreaterThan(0);
  });
});
