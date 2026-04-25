import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { VolcanoEscapeSettings } from "./state.js";

const slow: VolcanoEscapeSettings = { speed: "slow" };
const fast: VolcanoEscapeSettings = { speed: "fast" };

describe("VolcanoEscape initialState", () => {
  it("slow starts with 2 lava blobs", () => {
    expect(initialState(1, slow).lavaBlobs).toHaveLength(2);
  });

  it("fast starts with 4 lava blobs", () => {
    expect(initialState(1, fast).lavaBlobs).toHaveLength(4);
  });

  it("player starts at bottom center", () => {
    const s = initialState(1, slow);
    expect(s.playerRow).toBe(7);
    expect(s.playerCol).toBe(3);
  });

  it("starts not game over", () => {
    expect(initialState(1, slow).gameOver).toBe(false);
  });
});

describe("VolcanoEscape reducer", () => {
  it("restart resets state", () => {
    let s = initialState(1, slow);
    s = reducer(s, { type: "tick" });
    s = reducer(s, { type: "restart" });
    expect(s.tick).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("move up decreases player row", () => {
    const s = initialState(1, slow);
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerRow).toBe(6);
  });

  it("cannot move above row 0", () => {
    const s = { ...initialState(1, slow), playerRow: 0 };
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerRow).toBe(0);
  });

  it("reaching row 0 sets escaped", () => {
    const s = { ...initialState(1, slow), playerRow: 1, lavaBlobs: [] };
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.escaped).toBe(true);
    expect(s2.gameOver).toBe(true);
  });

  it("tick advances lava", () => {
    const s = initialState(1, slow);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.tick).toBe(1);
  });
});

describe("VolcanoEscape isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, slow))).toBeNull();
  });

  it("returns score on escape", () => {
    const s = { ...initialState(1, slow), gameOver: true, escaped: true, score: 600 };
    expect(isTerminal(s)!.score).toBeLessThanOrEqual(1000);
  });

  it("returns partial score when caught", () => {
    const s = { ...initialState(1, slow), gameOver: true, escaped: false, tick: 5 };
    expect(isTerminal(s)!.score).toBe(50);
  });
});
