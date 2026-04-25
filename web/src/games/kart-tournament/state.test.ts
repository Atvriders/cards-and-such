import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { tracks: "3" as const };

describe("KartTournament initialState", () => {
  it("starts on track 1 with 5 racers", () => {
    const s = initialState(42, defaultSettings);
    expect(s.track).toBe(1);
    expect(s.totalTracks).toBe(3);
    expect(s.racers).toHaveLength(5);
    expect(s.phase).toBe("racing");
  });

  it("all racers start at position 0", () => {
    const s = initialState(42, defaultSettings);
    for (const r of s.racers) expect(r.position).toBe(0);
  });

  it("player has name You", () => {
    const s = initialState(42, defaultSettings);
    expect(s.racers[s.playerIdx]!.name).toBe("You");
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});

describe("KartTournament reducer", () => {
  it("accelerate increases player speed", () => {
    const s = initialState(42, defaultSettings);
    const before = s.racers[s.playerIdx]!.speed;
    const s2 = reducer(s, { type: "drive", action: "accelerate" });
    expect(s2.racers[s2.playerIdx]!.speed).toBeGreaterThanOrEqual(before);
  });

  it("brake decreases player speed or holds at min", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "drive", action: "brake" });
    expect(s2.racers[s2.playerIdx]!.speed).toBeLessThanOrEqual(s.racers[s.playerIdx]!.speed);
  });

  it("drive moves racers forward", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "drive", action: "accelerate" });
    const totalPos = s2.racers.reduce((acc, r) => acc + r.position, 0);
    expect(totalPos).toBeGreaterThan(0);
  });

  it("game over phase is no-op", () => {
    const s = { ...initialState(42, defaultSettings), phase: "gameOver" as const };
    const s2 = reducer(s, { type: "drive", action: "accelerate" });
    expect(s2.phase).toBe("gameOver");
  });
});
