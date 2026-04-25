import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, N, CENTER } from "./state.js";

describe("Tawlbwrdd", () => {
  it("initialises with king at center, 12 defenders, 24 attackers", () => {
    const s = initialState(0, {});
    expect(s.board[CENTER]).toBe("king");
    expect(s.board.filter((c) => c === "defender").length).toBe(12);
    expect(s.board.filter((c) => c === "attacker").length).toBe(24);
    expect(s.winner).toBeNull();
    expect(s.turn).toBe("attacker");
  });

  it("board size is 11x11 = 121 cells", () => {
    const s = initialState(0, {});
    expect(s.board.length).toBe(N * N);
    expect(N).toBe(11);
  });

  it("isTerminal returns null mid-game, scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: "defender" })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: "attacker" })).toEqual({ score: 0 });
  });

  it("king wins by reaching corner", () => {
    const board = new Array(N * N).fill(null);
    board[1] = "king"; // one step from corner 0
    const s = { board, turn: "defender" as const, winner: null, selected: 1, rngSeed: 0, settings: {} };
    const next = reducer(s, { type: "move", from: 1, to: 0 });
    expect(next.winner).toBe("defender");
  });

  it("select non-defender returns no selection", () => {
    const s = initialState(0, {});
    const sd = { ...s, turn: "defender" as const };
    const next = reducer(sd, { type: "select", cell: 0 }); // corner, likely attacker
    // attacker cell (or null) should not be selectable
    const cellPiece = sd.board[0];
    if (cellPiece !== "defender" && cellPiece !== "king") {
      expect(next.selected).toBeNull();
    }
  });
});
