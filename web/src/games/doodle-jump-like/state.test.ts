import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DoodleJumpState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("player starts near top with platforms generated", () => {
    const s = initialState(42, settings);
    expect(s.platforms.length).toBeGreaterThan(0);
    expect(s.over).toBe(false);
  });

  it("score starts at 0", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
  });
});

describe("dir action", () => {
  it("sets dirInput", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "dir", dir: 1 });
    expect(after.dirInput).toBe(1);
    const after2 = reducer(after, { type: "dir", dir: -1 });
    expect(after2.dirInput).toBe(-1);
  });

  it("no-ops when game is over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "dir", dir: 1 });
    expect(after).toBe(s);
  });
});

describe("tick - physics", () => {
  it("player moves right when dirInput=1", () => {
    const s = { ...initialState(42, settings), playerVy: 0, dirInput: 1 as 1 };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.playerX).toBeGreaterThan(s.playerX);
  });

  it("player falls when no platform below", () => {
    const s: DoodleJumpState = {
      ...initialState(42, settings),
      playerY: 0.5,
      playerVy: 0,
      platforms: [],
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.playerY).toBeGreaterThan(0.5);
  });
});

describe("platform bounce", () => {
  it("player bounces upward when landing on platform", () => {
    const s: DoodleJumpState = {
      ...initialState(42, settings),
      playerX: 0.5,
      playerY: 0.09,   // just above platform at y=0.1
      playerVy: 0.5,   // falling
      platforms: [{ id: 1, x: 0.3, y: 0.1, w: 0.4 }],
    };
    const after = reducer(s, { type: "tick", dt: 0.05 });
    expect(after.playerVy).toBeLessThan(0);
  });
});

describe("game over", () => {
  it("over when player falls below camera view", () => {
    const s: DoodleJumpState = {
      ...initialState(42, settings),
      playerY: 2.5,
      cameraY: 0,
      platforms: [],
    };
    const after = reducer(s, { type: "tick", dt: 0.01 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 500 };
    expect(isTerminal(s)!.score).toBe(500);
  });
});
