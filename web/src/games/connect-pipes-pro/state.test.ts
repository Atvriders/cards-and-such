import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { size: "5" as const };

describe("ConnectPipesPro initialState", () => {
  it("creates a board with correct size", () => {
    const s = initialState(42, defaultSettings);
    expect(s.size).toBe(5);
    expect(s.won).toBe(false);
    expect(s.movesMade).toBe(0);
  });

  it("places the correct number of endpoint pairs for 5x5", () => {
    const s = initialState(42, defaultSettings);
    const colors = new Set(Object.values(s.endpoints));
    expect(colors.size).toBe(4);
  });

  it("creates a 7x7 board with 6 pairs", () => {
    const s = initialState(1, { size: "7" as const });
    expect(s.size).toBe(7);
    const colors = new Set(Object.values(s.endpoints));
    expect(colors.size).toBe(6);
  });

  it("activeColor is null at start", () => {
    const s = initialState(42, defaultSettings);
    expect(s.activeColor).toBeNull();
  });
});

describe("ConnectPipesPro reducer", () => {
  it("start action sets activeColor to endpoint color", () => {
    const s = initialState(42, defaultSettings);
    const ep = Object.entries(s.endpoints)[0]!;
    const [k, color] = ep;
    const [r, c] = k.split(",").map(Number) as [number, number];
    const s2 = reducer(s, { type: "start", row: r, col: c });
    expect(s2.activeColor).toBe(color);
  });

  it("start on non-endpoint does not change activeColor", () => {
    const s = initialState(42, defaultSettings);
    // Find a cell that is not an endpoint
    let nr = 0, nc = 0;
    for (let r = 0; r < s.size; r++) {
      for (let c = 0; c < s.size; c++) {
        if (!s.endpoints[`${r},${c}`]) { nr = r; nc = c; break; }
      }
    }
    const s2 = reducer(s, { type: "start", row: nr, col: nc });
    expect(s2.activeColor).toBeNull();
  });

  it("release action clears activeColor", () => {
    const s = initialState(42, defaultSettings);
    const ep = Object.entries(s.endpoints)[0]!;
    const [k] = ep;
    const [r, c] = k.split(",").map(Number) as [number, number];
    const s2 = reducer(s, { type: "start", row: r, col: c });
    const s3 = reducer(s2, { type: "release" });
    expect(s3.activeColor).toBeNull();
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
