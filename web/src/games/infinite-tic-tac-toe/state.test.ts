import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { opponent: "bot" as const };

describe("initialState", () => {
  it("starts with empty 25-cell board", () => {
    const s = initialState(42, def);
    expect(s.board.length).toBe(25);
    expect(s.board.every(c => c === null)).toBe(true);
  });

  it("X goes first", () => {
    const s = initialState(42, def);
    expect(s.currentPlayer).toBe("X");
  });

  it("no winner at start", () => {
    const s = initialState(42, def);
    expect(s.winner).toBeNull();
    expect(s.gameOver).toBe(false);
  });
});

describe("reducer — place", () => {
  it("places X at index 0 and switches to O", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "place", index: 0 });
    expect(s2.board[0]).toBe("X");
    expect(s2.currentPlayer).toBe("O");
    expect(s2.xMoves).toEqual([0]);
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "place", index: 5 });
    const s3 = reducer(s2, { type: "place", index: 5 });
    expect(s3).toBe(s2); // no-op
  });

  it("oldest X piece vanishes after 6 placements", () => {
    let s = initialState(42, def);
    // X places at 0,2,4,6,8,10 (alternating with O at 1,3,5,7,9,11)
    const xSlots = [0, 2, 4, 6, 8, 10];
    const oSlots = [1, 3, 5, 7, 9, 11];
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "place", index: xSlots[i]! });
      s = reducer(s, { type: "place", index: oSlots[i]! });
    }
    // X has exactly 6 pieces, oldest is at xSlots[0]=0
    expect(s.board[0]).toBe("X");
    // Place 7th X piece
    s = reducer(s, { type: "place", index: 12 });
    // Oldest X (index 0) should be gone
    expect(s.board[0]).toBeNull();
    expect(s.board[12]).toBe("X");
    expect(s.xMoves.length).toBe(6);
  });

  it("no-op after game over", () => {
    const s = { ...initialState(42, def), gameOver: true };
    const s2 = reducer(s, { type: "place", index: 0 });
    expect(s2).toBe(s);
  });
});

describe("winner detection", () => {
  it("detects 4-in-a-row win for X", () => {
    let s = initialState(42, def);
    // X: 0,1,2,3 (first row); O: 5,6,7 (second row partial)
    s = reducer(s, { type: "place", index: 0 });
    s = reducer(s, { type: "place", index: 5 });
    s = reducer(s, { type: "place", index: 1 });
    s = reducer(s, { type: "place", index: 6 });
    s = reducer(s, { type: "place", index: 2 });
    s = reducer(s, { type: "place", index: 7 });
    s = reducer(s, { type: "place", index: 3 });
    expect(s.winner).toBe("X");
    expect(s.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("X win = score 500", () => {
    const s = { ...initialState(42, def), gameOver: true, winner: "X" as const };
    expect(isTerminal(s)!.score).toBe(500);
  });

  it("draw = score 200", () => {
    const s = { ...initialState(42, def), gameOver: true, winner: "draw" as const };
    expect(isTerminal(s)!.score).toBe(200);
  });

  it("O win = score 0", () => {
    const s = { ...initialState(42, def), gameOver: true, winner: "O" as const };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
