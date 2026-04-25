import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, BOARD_SIZE, CENTER } from "./state.js";

const N = BOARD_SIZE;

describe("Brandub", () => {
  it("initialises board with king at center and 4 defenders", () => {
    const s = initialState(1, {});
    expect(s.board[CENTER]).toBe("king");
    const defenders = s.board.filter((c) => c === "defender");
    expect(defenders.length).toBe(4);
    const attackers = s.board.filter((c) => c === "attacker");
    expect(attackers.length).toBe(8);
    expect(s.winner).toBeNull();
    expect(s.turn).toBe("attacker");
  });

  it("rejects select of enemy piece on defender turn", () => {
    const s = initialState(0, {});
    // Manually set turn to defender
    const sd = { ...s, turn: "defender" as const };
    const next = reducer(sd, { type: "select", cell: 3 }); // top attacker
    expect(next.selected).toBeNull();
  });

  it("isTerminal returns null mid-game and scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: "defender" })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: "attacker" })).toEqual({ score: 0 });
  });

  it("king can move from center to adjacent empty", () => {
    // Build minimal board: king at center, no other pieces
    const board = new Array(N * N).fill(null);
    board[CENTER] = "king";
    const s = { board, turn: "defender" as const, winner: null, selected: null, rngSeed: 0, settings: {} };
    const next = reducer(s, { type: "select", cell: CENTER });
    expect(next.selected).toBe(CENTER);
  });

  it("selecting then moving king to corner wins", () => {
    // Minimal state: only king on board, place king one step from corner
    const board = new Array(N * N).fill(null);
    board[1] = "king"; // one step from top-left corner 0
    const s = { board, turn: "defender" as const, winner: null, selected: 1, rngSeed: 0, settings: {} };
    const next = reducer(s, { type: "move", from: 1, to: 0 });
    expect(next.winner).toBe("defender");
  });
});
