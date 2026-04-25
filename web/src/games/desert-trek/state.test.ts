import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DesertTrekSettings } from "./state.js";

const s5: DesertTrekSettings = { size: "5" };
const s7: DesertTrekSettings = { size: "7" };

describe("DesertTrek initialState", () => {
  it("5x5 grid has 25 cells", () => {
    expect(initialState(1, s5).grid).toHaveLength(25);
  });

  it("7x7 grid has 49 cells", () => {
    expect(initialState(1, s7).grid).toHaveLength(49);
  });

  it("starts at position 0 with full water", () => {
    const s = initialState(1, s5);
    expect(s.playerPos).toBe(0);
    expect(s.water).toBe(10);
  });

  it("first cell is start", () => {
    expect(initialState(1, s5).grid[0]).toBe("start");
  });

  it("last cell is end", () => {
    expect(initialState(1, s5).grid[24]).toBe("end");
  });
});

describe("DesertTrek reducer", () => {
  it("cannot move out of bounds up", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerPos).toBe(0);
  });

  it("restart resets state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "move", dir: "down" });
    s = reducer(s, { type: "restart" });
    expect(s.moves).toBe(0);
    expect(s.water).toBe(10);
  });

  it("quicksand drains extra water", () => {
    const s = initialState(1, s5);
    const forcedGrid = s.grid.map((c, i) => i === 1 ? "quicksand" as const : c);
    const forced = { ...s, grid: forcedGrid };
    const s2 = reducer(forced, { type: "move", dir: "right" });
    expect(s2.water).toBeLessThan(s.water - 1);
  });

  it("dune blocks movement", () => {
    const s = initialState(1, s5);
    const forcedGrid = s.grid.map((c, i) => i === 1 ? "dune" as const : c);
    const forced = { ...s, grid: forcedGrid };
    const s2 = reducer(forced, { type: "move", dir: "right" });
    expect(s2.playerPos).toBe(0);
  });
});

describe("DesertTrek isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("returns 0 when ran out of water", () => {
    const s = { ...initialState(1, s5), gameOver: true, won: false, water: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("returns positive score when won", () => {
    const s = { ...initialState(1, s5), gameOver: true, won: true, water: 5, moves: 8 };
    const result = isTerminal(s);
    expect(result!.score).toBeGreaterThan(0);
  });
});
