import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score } from "./state.js";

const S = { mode: "easy" as const };

describe("Indian Summer Mini", () => {
  it("initial state has 9 empty cells", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(9);
    expect(s.board.every(c => c === "")).toBe(true);
    expect(s.phase).toBe("playing");
  });
  it("deterministic init", () => { expect(initialState(50, S)).toEqual(initialState(50, S)); });
  it("play marks X and CPU plays O", () => {
    const s = initialState(2, S);
    const s2 = reducer(s, { type: "play", index: 0 });
    expect(s2.board[0]).toBe("X");
    expect(s2.board.filter(c => c === "O").length).toBeGreaterThanOrEqual(1);
  });
  it("game ends after board fills", () => {
    let s = initialState(3, S);
    for (let i = 0; i < 9 && s.phase === "playing"; i++) {
      const empty = s.board.findIndex(c => c === "");
      if (empty === -1) break;
      s = reducer(s, { type: "play", index: empty });
    }
    expect(s.phase).toBe("gameover");
  });
  it("score returns non-negative counts", () => {
    const r = score(["X","O","","X","","","","",""]);
    expect(r.player).toBeGreaterThanOrEqual(2);
    expect(r.cpu).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
