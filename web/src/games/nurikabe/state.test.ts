import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Nurikabe", () => {
  it("initialState creates all-unknown cells", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(s.cells.every((c) => c === "unknown")).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("toggleCell cycles unknown -> shaded -> unshaded -> unknown", () => {
    const s = initialState(1, { difficulty: "easy" });
    let s2 = reducer(s, { type: "toggleCell", idx: 1 });
    expect(s2.cells[1]).toBe("shaded");
    s2 = reducer(s2, { type: "toggleCell", idx: 1 });
    expect(s2.cells[1]).toBe("unshaded");
    s2 = reducer(s2, { type: "toggleCell", idx: 1 });
    expect(s2.cells[1]).toBe("unknown");
  });

  it("won stays false with unknown cells", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(isTerminal(s)).toBe(null);
  });

  it("moves increments on each toggle", () => {
    const s = initialState(1, { difficulty: "easy" });
    const s2 = reducer(s, { type: "toggleCell", idx: 0 });
    const s3 = reducer(s2, { type: "toggleCell", idx: 0 });
    expect(s3.moves).toBe(2);
  });

  it("won becomes true when solution is applied", () => {
    const s = initialState(1, { difficulty: "easy" });
    // Apply the puzzle's solution
    let s2 = s;
    for (let i = 0; i < s.puzzle.solution.length; i++) {
      const wantShaded = s.puzzle.solution[i]!;
      // cycle to correct state
      s2 = reducer(s2, { type: "toggleCell", idx: i }); // unknown -> shaded
      if (!wantShaded) {
        s2 = reducer(s2, { type: "toggleCell", idx: i }); // shaded -> unshaded
      }
    }
    expect(s2.won).toBe(true);
    expect(isTerminal(s2)?.score).toBeGreaterThanOrEqual(100);
  });

  it("medium puzzle loads with correct grid size", () => {
    const s = initialState(5, { difficulty: "medium" });
    expect(s.puzzle.rows).toBe(8);
    expect(s.puzzle.cols).toBe(8);
    expect(s.cells).toHaveLength(64);
  });

  it("hard puzzle loads with correct grid size", () => {
    const s = initialState(9, { difficulty: "hard" });
    expect(s.puzzle.rows).toBe(9);
    expect(s.cells).toHaveLength(81);
  });
});
