import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, check5, SIZE } from "./state.js";

const s0 = () => initialState(1, { aiStrength: "easy" });

describe("GomokuMini", () => {
  it("starts with 9×9 (81) cells", () => {
    expect(s0().board.length).toBe(SIZE * SIZE);
    expect(s0().phase).toBe("playing");
  });

  it("move places X and triggers a bot reply", () => {
    const s = reducer(s0(), { type: "move", index: 40 });
    expect(s.board[40]).toBe("X");
    // Bot should have placed at least one O
    const oCount = s.board.filter((c) => c === "O").length;
    expect(oCount).toBe(1);
  });

  it("check5 detects 5-in-a-row", () => {
    const b = Array(SIZE * SIZE).fill(null);
    for (let i = 0; i < 5; i++) b[i] = "X";
    expect(check5(b as never).winner).toBe("X");
  });

  it("check5 returns null for 4-in-a-row", () => {
    const b = Array(SIZE * SIZE).fill(null);
    for (let i = 0; i < 4; i++) b[i] = "X";
    expect(check5(b as never).winner).toBeNull();
  });

  it("isTerminal returns score 100 on win", () => {
    const s = { ...s0(), winner: "X" as const, phase: "gameover" as const };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
