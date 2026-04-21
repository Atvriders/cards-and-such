import { describe, expect, it } from "vitest";
import {
  connect4Initial,
  connect4Reduce,
  connect4Terminal,
  COLS,
  ROWS,
  type Connect4State,
} from "@cards/shared";

describe("connect-4 reducer", () => {
  it("initial state is empty and seat 0 starts", () => {
    const s = connect4Initial(0, 2);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe(0);
    expect(s.winner).toBe(null);
  });

  it("drop places piece in lowest empty row of column", () => {
    const s = connect4Initial(0, 2);
    const s1 = connect4Reduce(s, { type: "drop", col: 3 }, 0);
    expect(s1.board[(ROWS - 1) * COLS + 3]).toBe(0);
    expect(s1.turn).toBe(1);
  });

  it("rejects drop in full column", () => {
    let s = connect4Initial(0, 2);
    for (let i = 0; i < ROWS; i++) s = connect4Reduce(s, { type: "drop", col: 0 }, s.turn);
    const again = connect4Reduce(s, { type: "drop", col: 0 }, s.turn);
    expect(again).toBe(s);
  });

  it("rejects drop when not your turn", () => {
    const s = connect4Initial(0, 2);
    const bad = connect4Reduce(s, { type: "drop", col: 0 }, 1);
    expect(bad).toBe(s);
  });

  it("detects horizontal four-in-a-row", () => {
    let s = connect4Initial(0, 2);
    s = connect4Reduce(s, { type: "drop", col: 0 }, 0);
    s = connect4Reduce(s, { type: "drop", col: 0 }, 1);
    s = connect4Reduce(s, { type: "drop", col: 1 }, 0);
    s = connect4Reduce(s, { type: "drop", col: 1 }, 1);
    s = connect4Reduce(s, { type: "drop", col: 2 }, 0);
    s = connect4Reduce(s, { type: "drop", col: 2 }, 1);
    s = connect4Reduce(s, { type: "drop", col: 3 }, 0);
    expect(s.winner).toBe(0);
    expect(s.winningLine).toHaveLength(4);
  });

  it("terminal returns score 100 for winner", () => {
    const winState: Connect4State = {
      board: new Array(COLS * ROWS).fill(null),
      turn: 1, winner: 0, winningLine: [[0,0],[0,1],[0,2],[0,3]], movesPlayed: 7,
    };
    const t = connect4Terminal(winState);
    expect(t).toEqual({ winner: 0, score: 100 });
  });

  it("terminal returns score 50 for draw", () => {
    const drawState: Connect4State = {
      board: new Array(COLS * ROWS).fill(null),
      turn: 0, winner: "draw", winningLine: null, movesPlayed: COLS * ROWS,
    };
    expect(connect4Terminal(drawState)).toEqual({ winner: "draw", score: 50 });
  });
});
