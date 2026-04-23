import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WallJumperState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("player starts on wall 0 not jumping", () => {
    const s = initialState(42, settings);
    expect(s.playerWall).toBe(0);
    expect(s.jumping).toBe(false);
    expect(s.over).toBe(false);
  });

  it("starts with 3 lives and 0 score", () => {
    const s = initialState(42, settings);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
  });
});

describe("jump action", () => {
  it("starts a jump", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "jump" });
    expect(after.jumping).toBe(true);
  });

  it("cannot jump while already jumping", () => {
    const s = { ...initialState(42, settings), jumping: true, jumpProgress: 0.3 };
    const after = reducer(s, { type: "jump" });
    expect(after.jumpProgress).toBe(0.3); // unchanged
  });
});

describe("tick - jump completion", () => {
  it("completes jump and switches walls", () => {
    const s: WallJumperState = { ...initialState(42, settings), jumping: true, jumpProgress: 0.9, playerWall: 0 };
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.playerWall).toBe(1);
    expect(after.jumping).toBe(false);
  });
});

describe("target hit", () => {
  it("scores when landing near target on arrival wall", () => {
    const s: WallJumperState = {
      ...initialState(42, settings),
      playerWall: 0,
      playerY: 0.5,
      jumping: true,
      jumpProgress: 0.9,
      targets: [{ id: 1, wall: 1, y: 0.5, vy: 0, points: 2, hit: false }],
    };
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.score).toBe(2);
  });

  it("does not score when landing far from target", () => {
    const s: WallJumperState = {
      ...initialState(42, settings),
      playerWall: 0,
      playerY: 0.1,
      jumping: true,
      jumpProgress: 0.9,
      targets: [{ id: 1, wall: 1, y: 0.9, vy: 0, points: 3, hit: false }],
    };
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.score).toBe(0);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 15 };
    expect(isTerminal(s)!.score).toBe(15);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "jump" });
    expect(after).toBe(s);
  });
});
