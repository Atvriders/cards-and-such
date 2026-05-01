import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  step,
  liveCount,
  score,
  applyPreset,
  DEFAULT_SIZE,
} from "./state.js";

const S = { size: DEFAULT_SIZE };

describe("game-of-life-conway", () => {
  it("starts with empty grid at default size 12 and active phase", () => {
    const s = initialState(1, S);
    expect(s.size).toBe(12);
    expect(s.grid.length).toBe(12 * 12);
    expect(liveCount(s.grid)).toBe(0);
    expect(s.phase).toBe("active");
    expect(s.isRunning).toBe(false);
  });

  it("respects configurable grid size", () => {
    const s8 = initialState(1, { size: 8 });
    expect(s8.grid.length).toBe(64);
    const s16 = initialState(1, { size: 16 });
    expect(s16.grid.length).toBe(256);
  });

  it("toggle flips a cell on/off", () => {
    const s = reducer(initialState(1, S), { type: "toggle", idx: 5 });
    expect(s.grid[5]).toBe(1);
    const s2 = reducer(s, { type: "toggle", idx: 5 });
    expect(s2.grid[5]).toBe(0);
  });

  it("toggle is blocked while running", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggleRun" });
    expect(s.isRunning).toBe(true);
    const s2 = reducer(s, { type: "toggle", idx: 0 });
    expect(s2.grid[0]).toBe(0);
  });

  it("blinker oscillates with period 2 (Conway rules)", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "blinker" });
    const before = s.grid.slice();
    expect(liveCount(before)).toBe(3);
    const next = step(before, s.size);
    expect(liveCount(next)).toBe(3);
    // Different orientation
    expect(next.join(",")).not.toBe(before.join(","));
    // After two steps it returns to original
    const back = step(next, s.size);
    expect(back.join(",")).toBe(before.join(","));
  });

  it("block (still life) is stable: 2x2 block survives unchanged", () => {
    const size = 12;
    const grid = new Array(size * size).fill(0);
    grid[5 * size + 5] = 1;
    grid[5 * size + 6] = 1;
    grid[6 * size + 5] = 1;
    grid[6 * size + 6] = 1;
    const next = step(grid, size);
    expect(next.join(",")).toBe(grid.join(","));
  });

  it("isolated live cell dies (underpopulation)", () => {
    const size = 12;
    const grid = new Array(size * size).fill(0);
    grid[5 * size + 5] = 1;
    const next = step(grid, size);
    expect(liveCount(next)).toBe(0);
  });

  it("dead cell with exactly 3 neighbors becomes alive", () => {
    const size = 12;
    const grid = new Array(size * size).fill(0);
    grid[5 * size + 5] = 1;
    grid[5 * size + 6] = 1;
    grid[6 * size + 5] = 1;
    const next = step(grid, size);
    expect(next[6 * size + 6]).toBe(1);
  });

  it("step advances generation and tracks peak", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "glider" });
    const peak0 = s.maxLive;
    s = reducer(s, { type: "step" });
    expect(s.generation).toBe(1);
    expect(s.maxLive).toBeGreaterThanOrEqual(peak0);
  });

  it("toggleRun flips isRunning", () => {
    let s = initialState(1, S);
    expect(s.isRunning).toBe(false);
    s = reducer(s, { type: "toggleRun" });
    expect(s.isRunning).toBe(true);
    s = reducer(s, { type: "toggleRun" });
    expect(s.isRunning).toBe(false);
  });

  it("clear empties grid but preserves maxLive", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "random" });
    const peak = s.maxLive;
    expect(peak).toBeGreaterThan(0);
    s = reducer(s, { type: "clear" });
    expect(liveCount(s.grid)).toBe(0);
    expect(s.maxLive).toBe(peak);
    expect(s.generation).toBe(0);
  });

  it("reset wipes everything", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "random" });
    s = reducer(s, { type: "step" });
    s = reducer(s, { type: "reset" });
    expect(liveCount(s.grid)).toBe(0);
    expect(s.maxLive).toBe(0);
    expect(s.generation).toBe(0);
  });

  it("presets seed expected cell counts", () => {
    const { grid: glider } = applyPreset(1, 12, "glider");
    expect(liveCount(glider)).toBe(5);
    const { grid: blinker } = applyPreset(1, 12, "blinker");
    expect(liveCount(blinker)).toBe(3);
    const { grid: rpent } = applyPreset(1, 12, "rpentomino");
    expect(liveCount(rpent)).toBe(5);
    const { grid: pulsar16 } = applyPreset(1, 16, "pulsar");
    expect(liveCount(pulsar16)).toBeGreaterThan(20);
  });

  it("finish ends game and isTerminal returns score", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "preset", preset: "glider" });
    s = reducer(s, { type: "step" });
    s = reducer(s, { type: "finish" });
    expect(s.phase).toBe("done");
    expect(s.isRunning).toBe(false);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(score(s)).toBe(s.maxLive * Math.max(1, s.generation));
  });

  it("done phase rejects further actions", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "finish" });
    const s2 = reducer(s, { type: "toggle", idx: 0 });
    expect(s2).toBe(s);
  });
});
