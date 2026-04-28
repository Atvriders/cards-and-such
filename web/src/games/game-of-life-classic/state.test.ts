import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, BOARD } from "./state.js";

const S = { dummy: false };

describe("game-of-life-classic", () => {
  it("starts at square 0 with $100 and family 1", () => {
    const s = initialState(7, S);
    expect(s.pos).toBe(0);
    expect(s.cash).toBe(100);
    expect(s.family).toBe(1);
    expect(s.phase).toBe("spinning");
  });
  it("spin advances position", () => {
    const s = reducer(initialState(7, S), { type: "spin" });
    expect(s.pos).toBeGreaterThanOrEqual(1);
    expect(s.pos).toBeLessThanOrEqual(10);
    expect(s.lastSpin).not.toBeNull();
  });
  it("score never below 0", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 50; i++) {
      s = reducer(s, { type: "spin" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("eventually retires", () => {
    let s = initialState(3, S);
    for (let i = 0; i < 200; i++) {
      s = reducer(s, { type: "spin" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("board has 30 squares with retire at end", () => {
    expect(BOARD.length).toBeGreaterThanOrEqual(30);
    expect(BOARD[BOARD.length - 1]!.kind).toBe("retire");
  });
});
