import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RacingStuntsSettings } from "./state.js";

const s3: RacingStuntsSettings = { laps: "3" };
const s5: RacingStuntsSettings = { laps: "5" };

describe("RacingStunts initialState", () => {
  it("sets correct totalLaps for 3", () => {
    expect(initialState(1, s3).totalLaps).toBe(3);
  });

  it("sets correct totalLaps for 5", () => {
    expect(initialState(1, s5).totalLaps).toBe(5);
  });

  it("starts at lap 1", () => {
    expect(initialState(1, s3).lap).toBe(1);
  });

  it("starts with 0 score", () => {
    expect(initialState(1, s3).score).toBe(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s3).gameOver).toBe(false);
  });
});

describe("RacingStunts reducer", () => {
  it("accelerate increases speed", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "accelerate" });
    expect(s2.speed).toBeGreaterThan(s.speed);
  });

  it("accelerate advances position", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "accelerate" });
    expect(s2.position).toBeGreaterThan(s.position);
  });

  it("restart resets to lap 1", () => {
    let s = initialState(1, s3);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "accelerate" });
    s = reducer(s, { type: "restart" });
    expect(s.lap).toBe(1);
    expect(s.score).toBe(0);
  });

  it("stunt fails gracefully when not in stunt zone", () => {
    const s = { ...initialState(1, s3), stuntZone: false };
    const s2 = reducer(s, { type: "stunt", stuntType: "drift" });
    expect(s2.lastResult).toBe("fail");
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("isTerminal returns score when game over", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 500 };
    expect(isTerminal(s)!.score).toBe(500);
  });

  it("isTerminal caps score at 1000", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 5000 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});
