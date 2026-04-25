import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BikeRaceSettings } from "./state.js";

const s500: BikeRaceSettings = { distance: "500" };
const s1000: BikeRaceSettings = { distance: "1000" };

describe("BikeRace initialState", () => {
  it("sets totalDistance to 500", () => {
    expect(initialState(1, s500).totalDistance).toBe(500);
  });

  it("sets totalDistance to 1000", () => {
    expect(initialState(1, s1000).totalDistance).toBe(1000);
  });

  it("starts at 0 distance", () => {
    expect(initialState(1, s500).distanceCovered).toBe(0);
  });

  it("starts with full stamina", () => {
    expect(initialState(1, s500).stamina).toBe(100);
  });

  it("not game over initially", () => {
    expect(initialState(1, s500).gameOver).toBe(false);
  });
});

describe("BikeRace reducer", () => {
  it("pedal increases speed and distance", () => {
    const s = initialState(1, s500);
    const s2 = reducer(s, { type: "pedal" });
    expect(s2.distanceCovered).toBeGreaterThan(0);
    expect(s2.speed).toBeGreaterThan(s.speed);
  });

  it("coast reduces speed but advances distance", () => {
    const s = { ...initialState(1, s500), speed: 5 };
    const s2 = reducer(s, { type: "coast" });
    expect(s2.distanceCovered).toBeGreaterThan(0);
    expect(s2.speed).toBeLessThan(5);
  });

  it("pedal drains stamina", () => {
    const s = initialState(1, s500);
    const s2 = reducer(s, { type: "pedal" });
    expect(s2.stamina).toBeLessThan(100);
  });

  it("restart resets state", () => {
    let s = initialState(1, s500);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "pedal" });
    s = reducer(s, { type: "restart" });
    expect(s.distanceCovered).toBe(0);
    expect(s.stamina).toBe(100);
  });

  it("isTerminal returns null initially", () => {
    expect(isTerminal(initialState(1, s500))).toBeNull();
  });

  it("isTerminal returns score when game over", () => {
    const s = { ...initialState(1, s500), gameOver: true, score: 700 };
    expect(isTerminal(s)!.score).toBe(700);
  });
});
