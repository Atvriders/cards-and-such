import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Super Tic-Tac-Toe", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(1);
    expect(s.phase).toBe("playing");
    expect(s.current).toBe("X");
    expect(s.boards.length).toBe(9);
    expect(s.claimed.every(c => c === null)).toBe(true);
    expect(s.winner).toBeNull();
  });

  it("places X on first move", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "move", boardIndex: 4, cellIndex: 4 });
    expect(s2.boards[4]?.[4]).toBe("X");
    expect(s2.current).toBe("O");
    expect(s2.moves).toBe(1);
  });

  it("ignores move to wrong board when nextBoard is set", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "move", boardIndex: 4, cellIndex: 3 });
    // nextBoard should now be 3
    expect(s2.nextBoard).toBe(3);
    // try to play on board 5 instead - should be rejected
    const s3 = reducer(s2, { type: "move", boardIndex: 5, cellIndex: 0 });
    expect(s3.boards[5]?.[0]).toBeNull();
    expect(s3.current).toBe("O"); // still O's turn
  });

  it("ignores move on occupied cell", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "move", boardIndex: 4, cellIndex: 4 });
    const s3 = reducer(s2, { type: "move", boardIndex: 4, cellIndex: 4 });
    // should be rejected since cell is taken (and wrong board anyway)
    expect(s3.boards[4]?.[4]).toBe("X");
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("reset action restarts the game", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "move", boardIndex: 0, cellIndex: 0 });
    const s3 = reducer(s2, { type: "reset", seed: 99 });
    expect(s3.moves).toBe(0);
    expect(s3.current).toBe("X");
    expect(s3.phase).toBe("playing");
  });
});
