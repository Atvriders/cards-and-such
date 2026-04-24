import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves, cellKey, hexNeighbors } from "./state.js";
import type { AgonSettings, AgonState } from "./state.js";

const settings: AgonSettings = { opponent: "bot" };

describe("Agon initialState", () => {
  it("places 7 white and 7 black pieces", () => {
    const s = initialState(1, settings);
    let white = 0, black = 0;
    for (const p of s.board.values()) {
      if (p.color === "white") white++;
      else black++;
    }
    expect(white).toBe(7);
    expect(black).toBe(7);
  });

  it("starts with white queen and black queen on board", () => {
    const s = initialState(1, settings);
    const queens = [...s.board.values()].filter((p) => p.type === "queen");
    expect(queens.length).toBe(2);
  });

  it("starts white's turn with no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("white");
    expect(s.winner).toBeNull();
  });
});

describe("Agon legalMoves", () => {
  it("white queen has at least one legal move at start", () => {
    const s = initialState(1, settings);
    const moves = legalMoves(s.board, "white");
    expect(moves.length).toBeGreaterThan(0);
  });
});

describe("Agon reducer", () => {
  it("ignores select of opponent piece", () => {
    const s = initialState(1, settings);
    const blackPieceKey = [...s.board.entries()].find(([, p]) => p.color === "black")![0];
    const [q, r] = blackPieceKey.split(",").map(Number);
    const s2 = reducer(s, { type: "select", cell: { q: q!, r: r! } });
    expect(s2.selected).toBeNull();
  });

  it("can select a white piece", () => {
    const s = initialState(1, settings);
    const [key] = [...s.board.entries()].find(([, p]) => p.color === "white")!;
    const [q, r] = key.split(",").map(Number);
    const s2 = reducer(s, { type: "select", cell: { q: q!, r: r! } });
    expect(s2.selected).not.toBeNull();
  });

  it("does not change state after game over", () => {
    const s = initialState(1, settings);
    const done: AgonState = { ...s, winner: "white" };
    const [key] = [...done.board.entries()].find(([, p]) => p.color === "white")!;
    const [q, r] = key.split(",").map(Number);
    const s2 = reducer(done, { type: "select", cell: { q: q!, r: r! } });
    expect(s2).toBe(done);
  });
});

describe("Agon isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 20 on white win", () => {
    const s: AgonState = { ...initialState(1, settings), winner: "white" };
    expect(isTerminal(s)?.score).toBe(20);
  });

  it("returns score 0 on black win", () => {
    const s: AgonState = { ...initialState(1, settings), winner: "black" };
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("hexNeighbors of centre has 6 neighbours", () => {
    const nb = hexNeighbors({ q: 0, r: 0 });
    expect(nb.length).toBe(6);
  });
});
