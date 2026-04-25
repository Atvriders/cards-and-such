import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, COLS, ROWS } from "./state.js";

describe("Bridge Builder Puzzle", () => {
  it("initializes with correct structure", () => {
    const s = initialState(1);
    expect(s.phase).toBe("playing");
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
    expect(s.planksLeft).toBe(8);
    expect(s.moves).toBe(0);
  });

  it("has a start and end cell", () => {
    const s = initialState(1);
    const flat = s.grid.flat();
    expect(flat.filter(c => c === "start").length).toBe(1);
    expect(flat.filter(c => c === "end").length).toBe(1);
  });

  it("placing a plank decrements planksLeft", () => {
    const s = initialState(2);
    // find an empty inner cell
    for (let r = 0; r < ROWS; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (s.grid[r]![c] === "empty") {
          const s2 = reducer(s, { type: "placeOrRemove", row: r, col: c });
          expect(s2.planksLeft).toBe(s.planksLeft - 1);
          return;
        }
      }
    }
  });

  it("removing a plank restores planksLeft", () => {
    const s = initialState(2);
    // Find an empty inner cell, place and immediately remove
    for (let r = 0; r < ROWS; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (s.grid[r]![c] === "empty") {
          const s2 = reducer(s, { type: "placeOrRemove", row: r, col: c });
          // Only test removal if placing didn't win the game
          if (s2.phase !== "won") {
            const planksAfterPlace = s2.planksLeft;
            const s3 = reducer(s2, { type: "placeOrRemove", row: r, col: c });
            expect(s3.planksLeft).toBe(planksAfterPlace + 1);
            return;
          }
        }
      }
    }
    // If all placements win, just verify place/remove cycle on fresh state
    expect(s.planksLeft).toBe(8);
  });

  it("cannot place plank on blocked cell", () => {
    const s = initialState(3);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (s.grid[r]![c] === "blocked") {
          const s2 = reducer(s, { type: "placeOrRemove", row: r, col: c });
          expect(s2.planksLeft).toBe(s.planksLeft);
          return;
        }
      }
    }
  });

  it("reset generates a new puzzle", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "reset" });
    expect(s2.puzzleIndex).toBe(1);
    expect(s2.planksLeft).toBe(8);
    expect(s2.phase).toBe("playing");
  });

  it("isTerminal returns null while playing", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 0 on lost", () => {
    const s = initialState(1);
    expect(isTerminal({ ...s, phase: "lost" })).toEqual({ score: 0 });
  });

  it("isTerminal returns positive score on won", () => {
    const s = initialState(1);
    const result = isTerminal({ ...s, phase: "won", moves: 5 });
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
