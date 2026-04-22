import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ClimbJumperState } from "./state.js";

const settings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("player starts at y=0 with upward velocity", () => {
    const s = initialState(42, settings);
    expect(s.playerY).toBe(0);
    expect(s.playerVy).toBeGreaterThan(0);
  });

  it("platforms are generated", () => {
    const s = initialState(42, settings);
    expect(s.platforms.length).toBeGreaterThan(0);
  });

  it("score starts at 0 and not over", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("moveLeft/moveRight", () => {
  it("sets movingLeft flag", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "moveLeft", on: true });
    expect(after.movingLeft).toBe(true);
    const off = reducer(after, { type: "moveLeft", on: false });
    expect(off.movingLeft).toBe(false);
  });

  it("sets movingRight flag", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "moveRight", on: true });
    expect(after.movingRight).toBe(true);
  });
});

describe("tick - gravity", () => {
  it("player falls when no platform below", () => {
    // Place player high above all platforms with no velocity
    const s = initialState(42, settings);
    const lifted: ClimbJumperState = {
      ...s,
      playerY: 5.0,
      playerVy: 0,
      cameraY: 4.5,
      platforms: [], // no platforms
    };
    const after = reducer(lifted, { type: "tick", dt: 0.1 });
    expect(after.playerVy).toBeLessThan(0); // gravity pulled it down
  });
});

describe("tick - platform landing causes jump", () => {
  it("landing on platform sets positive vy", () => {
    const s = initialState(42, settings);
    const platform = { id: 999, x: 0.0, y: 1.0, width: 1.0 }; // full-width platform
    const falling: ClimbJumperState = {
      ...s,
      playerX: 0.5,
      playerY: 1.05,
      playerVy: -0.5, // falling downward
      platforms: [platform],
    };
    const after = reducer(falling, { type: "tick", dt: 0.1 });
    // Should have landed and bounced
    expect(after.playerVy).toBeGreaterThan(0);
  });
});

describe("tick - score increases with height", () => {
  it("score is max height * 100", () => {
    const s = initialState(42, settings);
    const high: ClimbJumperState = {
      ...s,
      playerY: 3.5,
      playerVy: 0.5,
      score: 0,
      cameraY: 3.0,
      platforms: [{ id: 1, x: 0, y: 3.6, width: 1 }],
    };
    const after = reducer(high, { type: "tick", dt: 0.016 });
    expect(after.score).toBeGreaterThan(0);
  });
});

describe("game over", () => {
  it("sets over=true when player falls off bottom of screen", () => {
    const s = initialState(42, settings);
    const falling: ClimbJumperState = {
      ...s,
      playerY: -0.5, // way below camera
      playerVy: -1.0,
      cameraY: 0.0,
      platforms: [],
    };
    const after = reducer(falling, { type: "tick", dt: 0.1 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during game", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(42, settings), over: true, score: 350 };
    expect(isTerminal(s)!.score).toBe(350);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after).toBe(s);
  });
});
