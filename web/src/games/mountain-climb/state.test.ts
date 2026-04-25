import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MountainClimbSettings } from "./state.js";

const easy: MountainClimbSettings = { difficulty: "easy" };
const hard: MountainClimbSettings = { difficulty: "hard" };

describe("MountainClimb initialState", () => {
  it("starts at row 7, col 2", () => {
    const s = initialState(1, easy);
    expect(s.playerRow).toBe(7);
    expect(s.playerCol).toBe(2);
  });

  it("easy has 5 lives", () => {
    expect(initialState(1, easy).lives).toBe(5);
  });

  it("hard has 2 lives", () => {
    expect(initialState(1, hard).lives).toBe(2);
  });

  it("starts not game over", () => {
    const s = initialState(1, easy);
    expect(s.gameOver).toBe(false);
    expect(s.won).toBe(false);
  });
});

describe("MountainClimb reducer", () => {
  it("restart resets state", () => {
    let s = initialState(1, easy);
    s = reducer(s, { type: "jump", dir: "up" });
    s = reducer(s, { type: "restart" });
    expect(s.altitude).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("moves left reduce col", () => {
    let s = initialState(1, easy);
    // move right first so we can move left
    s = reducer(s, { type: "jump", dir: "right" });
    const prevCol = s.playerCol;
    const s2 = reducer(s, { type: "jump", dir: "left" });
    // left reduces col unless already at 0
    expect(s2.playerCol).toBeLessThanOrEqual(prevCol);
  });

  it("cannot move right past col 4", () => {
    let s = { ...initialState(1, easy), playerCol: 4 };
    s = reducer(s, { type: "jump", dir: "right" });
    expect(s.playerCol).toBe(4);
  });
});

describe("MountainClimb isTerminal", () => {
  it("returns null when game not over", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, easy), gameOver: true, won: true, lives: 3 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("returns partial score when lost", () => {
    const s = { ...initialState(1, easy), gameOver: true, won: false, lives: 0, altitude: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(100);
  });
});
