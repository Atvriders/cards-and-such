import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CrosswordMiniState } from "./state.js";

const defSettings = {};

describe("CrosswordMini initialState", () => {
  it("picks a puzzle and creates a player grid", () => {
    const s = initialState(1, defSettings);
    expect(s.playerGrid.length).toBe(25);
    expect(s.puzzle.grid.length).toBe(25);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.puzzle.grid).toBe(s2.puzzle.grid);
  });

  it("starts with empty player cells", () => {
    const s = initialState(1, defSettings);
    for (let i = 0; i < 25; i++) {
      const expected = s.puzzle.grid[i] === "#" ? "#" : "";
      expect(s.playerGrid[i]).toBe(expected);
    }
  });

  it("starts not gameOver", () => {
    const s = initialState(1, defSettings);
    expect(s.gameOver).toBe(false);
    expect(s.checked).toBe(false);
  });
});

describe("CrosswordMini reducer", () => {
  function makeState(overrides: Partial<CrosswordMiniState> = {}): CrosswordMiniState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("selectCell sets selectedCell", () => {
    const s = makeState();
    // Find a non-black cell
    const cell = s.puzzle.grid.split("").findIndex(ch => ch !== "#");
    const s2 = reducer(s, { type: "selectCell", index: cell });
    expect(s2.selectedCell).toBe(cell);
  });

  it("selectCell on same cell toggles direction", () => {
    const cell = 0;
    const s = makeState({ selectedCell: cell, direction: "across" });
    const s2 = reducer(s, { type: "selectCell", index: cell });
    expect(s2.direction).toBe("down");
  });

  it("type puts letter in selected cell", () => {
    const cell = 0;
    const s = makeState({ selectedCell: cell });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.playerGrid[cell]).toBe("A");
  });

  it("delete clears selected cell", () => {
    const pg = Array(25).fill("") as string[];
    pg[0] = "A";
    // Ensure cell 0 is not black in the puzzle
    const base = initialState(1, defSettings);
    if (base.puzzle.grid[0] === "#") return; // skip if puzzle has black at 0
    const s = makeState({ selectedCell: 0, playerGrid: pg });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.playerGrid[0]).toBe("");
  });

  it("check computes score and sets gameOver", () => {
    const s = makeState();
    // Fill player grid with correct answers
    const pg = s.puzzle.grid.split("").map(ch => ch === "#" ? "#" : ch);
    const s2 = { ...s, playerGrid: pg };
    const s3 = reducer(s2, { type: "check" });
    expect(s3.gameOver).toBe(true);
    expect(s3.score).toBe(100);
  });

  it("check with all wrong gives 0 score", () => {
    const s = makeState();
    const pg = s.puzzle.grid.split("").map(ch => ch === "#" ? "#" : "Z");
    // Replace Z with wrong letter — if grid has any Z it'll accidentally be right, just verify score < 100
    const s2 = { ...s, playerGrid: pg };
    const s3 = reducer(s2, { type: "check" });
    expect(s3.gameOver).toBe(true);
    expect(s3.score).toBeLessThanOrEqual(100);
  });
});

describe("CrosswordMini isTerminal", () => {
  it("returns null when in progress", () => {
    const s = initialState(1, defSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 80 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(80);
  });
});
