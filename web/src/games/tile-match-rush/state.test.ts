import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, _canConnect, _hasAnyMove } from "./state.js";
import type { TileMatchRushState } from "./state.js";

const defaultSettings = { duration: "120" as const, gridSize: "medium" as const };
const smallSettings = { duration: "60" as const, gridSize: "small" as const };

describe("TileMatchRush — initialState", () => {
  it("creates correct grid dimensions for each size", () => {
    const sm = initialState(1, { duration: "60", gridSize: "small" });
    expect(sm.rows).toBe(6);
    expect(sm.cols).toBe(8);
    expect(sm.grid.length).toBe(48);

    const md = initialState(1, { duration: "120", gridSize: "medium" });
    expect(md.rows).toBe(8);
    expect(md.cols).toBe(10);
    expect(md.grid.length).toBe(80);

    const lg = initialState(1, { duration: "180", gridSize: "large" });
    expect(lg.rows).toBe(10);
    expect(lg.cols).toBe(12);
    expect(lg.grid.length).toBe(120);
  });

  it("each face appears an even number of times", () => {
    const s = initialState(42, defaultSettings);
    const counts = new Map<string, number>();
    for (const v of s.grid) {
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    for (const [, count] of counts) {
      expect(count % 2).toBe(0);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.grid).toEqual(s2.grid);
  });

  it("starts with score 0, combo 0, elapsed 0", () => {
    const s = initialState(42, defaultSettings);
    expect(s.score).toBe(0);
    expect(s.combo).toBe(0);
    expect(s.elapsed).toBe(0);
    expect(s.won).toBe(false);
    expect(s.gameOver).toBe(false);
  });
});

describe("TileMatchRush — tick reducer", () => {
  it("updates elapsed time", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "tick", elapsed: 5.5 });
    expect(s2.elapsed).toBe(5.5);
  });

  it("sets gameOver when elapsed >= duration", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "tick", elapsed: 120 });
    expect(s2.gameOver).toBe(true);
  });

  it("clamps elapsed to duration", () => {
    const s = initialState(42, { duration: "60", gridSize: "small" });
    const s2 = reducer(s, { type: "tick", elapsed: 200 });
    expect(s2.elapsed).toBe(60);
    expect(s2.gameOver).toBe(true);
  });
});

describe("TileMatchRush — select reducer", () => {
  it("selecting a tile sets selectedIdx", () => {
    const s = initialState(42, defaultSettings);
    const nonNull = s.grid.findIndex((v) => v !== null);
    const s2 = reducer(s, { type: "select", idx: nonNull });
    expect(s2.selectedIdx).toBe(nonNull);
  });

  it("clicking same tile deselects it", () => {
    const s = initialState(42, defaultSettings);
    const nonNull = s.grid.findIndex((v) => v !== null);
    let cur = reducer(s, { type: "select", idx: nonNull });
    cur = reducer(cur, { type: "select", idx: nonNull });
    expect(cur.selectedIdx).toBeNull();
  });

  it("matching connected pair removes tiles and adds score", () => {
    const grid: (string | null)[] = Array(48).fill(null);
    grid[0] = "🀐";
    grid[1] = "🀐";
    const s: TileMatchRushState = {
      ...initialState(1, smallSettings),
      grid,
      selectedIdx: null,
      removed: 0,
      total: 48,
    };
    let cur = reducer(s, { type: "select", idx: 0 });
    cur = reducer(cur, { type: "select", idx: 1 });
    expect(cur.grid[0]).toBeNull();
    expect(cur.grid[1]).toBeNull();
    expect(cur.score).toBe(100); // base score, combo=1
    expect(cur.removed).toBe(2);
  });

  it("combo increases on quick successive matches", () => {
    const grid: (string | null)[] = Array(48).fill(null);
    grid[0] = "🀐"; grid[1] = "🀐";
    grid[2] = "🀑"; grid[3] = "🀑";
    // Start with combo=1 and lastMatchTime recent (elapsed=1, lastMatchTime=0 means 1s ago)
    const s: TileMatchRushState = {
      ...initialState(1, smallSettings),
      grid,
      selectedIdx: null,
      removed: 0,
      total: 48,
      elapsed: 1,
      combo: 1,
      lastMatchTime: 0, // last match was at time 0ms → timeSinceLast=1000ms ≤ 2000ms
    };
    // Match tiles 0+1: timeSinceLast=1000 ≤ 2000, so combo = state.combo + 1 = 2
    let cur = reducer(s, { type: "select", idx: 0 });
    cur = reducer(cur, { type: "select", idx: 1 });
    expect(cur.combo).toBe(2);
    expect(cur.score).toBe(200); // 100 * combo(2)
  });
});

describe("TileMatchRush — isTerminal", () => {
  it("returns null for active game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score on won", () => {
    const s: TileMatchRushState = { ...initialState(1, defaultSettings), won: true, score: 500 };
    expect(isTerminal(s)).toEqual({ score: 500 });
  });

  it("returns score on gameOver", () => {
    const s: TileMatchRushState = { ...initialState(1, defaultSettings), gameOver: true, score: 300 };
    expect(isTerminal(s)).toEqual({ score: 300 });
  });

  it("_canConnect returns true for adjacent same-face tiles in empty grid", () => {
    const grid: (string | null)[] = Array(48).fill(null);
    grid[0] = "🀐";
    grid[1] = "🀐";
    expect(_canConnect(grid, 6, 8, 0, 1)).toBe(true);
  });

  it("_hasAnyMove returns false for all-null grid", () => {
    expect(_hasAnyMove(Array(48).fill(null), 6, 8)).toBe(false);
  });
});
