import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PIPE_OPENINGS } from "./state.js";

const settings = { size: "7" as const };
const settings5 = { size: "5" as const };

describe("initialState", () => {
  it("creates a 7×7 grid", () => {
    const s = initialState(42, settings);
    expect(s.grid.length).toBe(7);
    expect(s.grid[0]!.length).toBe(7);
  });

  it("places source at sourceRow, col 0", () => {
    const s = initialState(42, settings);
    expect(s.grid[s.sourceRow]![0]!.type).toBe("source");
  });

  it("has 5 items in queue", () => {
    const s = initialState(1, settings);
    expect(s.queue.length).toBe(5);
  });

  it("starts not over", () => {
    expect(initialState(7, settings5).over).toBe(false);
  });
});

describe("PIPE_OPENINGS", () => {
  it("NS pipe opens N and S", () => {
    expect(PIPE_OPENINGS.NS.N).toBe(true);
    expect(PIPE_OPENINGS.NS.S).toBe(true);
    expect(PIPE_OPENINGS.NS.E).toBe(false);
    expect(PIPE_OPENINGS.NS.W).toBe(false);
  });

  it("NESW cross opens all directions", () => {
    const o = PIPE_OPENINGS.NESW;
    expect(o.N && o.E && o.S && o.W).toBe(true);
  });
});

describe("reducer - place", () => {
  it("places a pipe piece on an empty cell", () => {
    const s = initialState(42, settings);
    const r = 0, c = 1;
    const s2 = reducer(s, { type: "place", row: r, col: c });
    expect(s2.grid[r]![c]!.type).not.toBeNull();
    expect(s2.queue.length).toBe(5); // queue refills
  });

  it("cannot place on source cell", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "place", row: s.sourceRow, col: 0 });
    expect(s2.grid[s.sourceRow]![0]!.type).toBe("source");
  });

  it("queue advances after placement", () => {
    const s = initialState(42, settings);
    const firstPipe = s.queue[0];
    const s2 = reducer(s, { type: "place", row: 0, col: 1 });
    // The placed pipe was the first in queue
    expect(s2.grid[0]![1]!.type).toBe(firstPipe);
  });

  it("does not change state when over", () => {
    const s = { ...initialState(1, settings), over: true };
    const s2 = reducer(s, { type: "place", row: 0, col: 1 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null while ongoing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 8 };
    expect(isTerminal(s)).toEqual({ score: 8 });
  });
});
