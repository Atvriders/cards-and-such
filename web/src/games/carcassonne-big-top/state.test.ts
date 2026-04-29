import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TILES, GRID_SIZE, CELL_COUNT } from "./state.js";
const S = { dummy: false };
describe("Carcassonne: Under the Big Top", () => {
  it("starts in playing phase with empty board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.placed).toBe(0);
    expect(s.cells.length).toBe(CELL_COUNT);
  });
  it("place advances counter", () => {
    const s = reducer(initialState(1, S), { type: "place", index: 0 });
    expect(s.placed).toBeGreaterThanOrEqual(1);
  });
  it("invalid placement on filled cell ignored", () => {
    const s1 = reducer(initialState(1, S), { type: "place", index: 0 });
    const s2 = reducer(s1, { type: "place", index: 0 });
    expect(s2.placed).toBe(s1.placed);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after TOTAL_TILES placements with non-negative score", () => {
    let s = initialState(1, S);
    let i = 0;
    while (s.phase === "playing" && i < CELL_COUNT) {
      s = reducer(s, { type: "place", index: i });
      i++;
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("GRID_SIZE matches expected value", () => {
    expect(GRID_SIZE).toBeGreaterThanOrEqual(3);
    expect(TOTAL_TILES).toBeGreaterThanOrEqual(8);
  });
});
