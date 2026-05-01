import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, GRID_SIZE, TOTAL_TILES, NUM_TYPES } from "./state.js";

const S = { dummy: false };

describe("Carcassonne: Safari tile placement", () => {
  it("initial state has empty cells and a queue", () => {
    const s = initialState(1, S);
    expect(s.cells.length).toBe(GRID_SIZE * GRID_SIZE);
    expect(s.queue.length).toBe(TOTAL_TILES);
    expect(s.placed).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("placing a tile advances state", () => {
    const s = reducer(initialState(2, S), { type: "place", index: 0 });
    expect(s.cells[0]).toBeGreaterThanOrEqual(0);
    expect(s.cells[0]).toBeLessThan(NUM_TYPES);
    expect(s.placed).toBe(1);
  });

  it("rejects placement on filled cell", () => {
    const s1 = reducer(initialState(3, S), { type: "place", index: 0 });
    const s2 = reducer(s1, { type: "place", index: 0 });
    expect(s2).toBe(s1);
  });

  it("ends after TOTAL_TILES placements", () => {
    let s = initialState(4, S);
    let cell = 0;
    while (s.phase !== "done" && cell < s.cells.length) {
      if ((s.cells[cell] ?? -1) < 0) s = reducer(s, { type: "place", index: cell });
      cell++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("score is non-negative", () => {
    let s = initialState(5, S);
    let cell = 0;
    while (s.phase !== "done" && cell < s.cells.length) {
      if ((s.cells[cell] ?? -1) < 0) s = reducer(s, { type: "place", index: cell });
      cell++;
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
