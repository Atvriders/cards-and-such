import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS, checkWin } from "./state.js";

const S = { dummy: false };

describe("TicTacToeBlitz", () => {
  it("starts playing with empty board and full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.ticksRemaining).toBe(TIMER_TICKS);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.score).toBe(0);
  });

  it("tick decrements timer", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.ticksRemaining).toBe(TIMER_TICKS - 1);
  });

  it("play places X then CPU plays O", () => {
    const s = reducer(initialState(1, S), { type: "play", idx: 0 });
    expect(s.board[0]).toBe("X");
    const oCount = s.board.filter((c) => c === "O").length;
    expect(oCount).toBeGreaterThanOrEqual(1);
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("ends after TIMER_TICKS ticks", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("checkWin detects horizontal win", () => {
    expect(checkWin(["X", "X", "X", null, null, null, null, null, null])).toBe("X");
  });

  it("checkWin detects diagonal", () => {
    expect(checkWin(["O", null, null, null, "O", null, null, null, "O"])).toBe("O");
  });

  it("after a roundOver, next clears board", () => {
    let s = initialState(1, S);
    // play to first cell repeatedly until round over
    let safety = 20;
    while (!s.roundOver && safety-- > 0) {
      const i = s.board.findIndex((c) => c === null);
      if (i < 0) break;
      s = reducer(s, { type: "play", idx: i });
    }
    if (s.roundOver) {
      const next = reducer(s, { type: "next" });
      expect(next.board.every((c) => c === null)).toBe(true);
      expect(next.roundOver).toBe(false);
    }
  });
});
