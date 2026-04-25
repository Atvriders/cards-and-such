import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_SEASONS, DAYS_PER_SEASON } from "./state.js";

describe("Forager", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.seasonIdx).toBe(0);
    expect(s.day).toBe(1);
    expect(s.energy).toBe(10);
    expect(s.phase).toBe("forage");
  });

  it("foraging costs energy and produces a haul", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "forage", resource: "berries" });
    expect(s2.energy).toBeLessThan(s.energy);
    expect(s2.phase).toBe("camp");
  });

  it("resting restores energy", () => {
    const s = { ...initialState(42), energy: 3 };
    const s2 = reducer(s, { type: "rest" });
    expect(s2.energy).toBeGreaterThan(3);
    expect(s2.phase).toBe("camp");
  });

  it("nextDay advances the day counter", () => {
    const s = { ...initialState(42), phase: "camp" as const };
    const s2 = reducer(s, { type: "nextDay" });
    expect(s2.day).toBe(2);
    expect(s2.phase).toBe("forage");
  });

  it("foraging fails with insufficient energy", () => {
    const s = { ...initialState(42), energy: 0 };
    const s2 = reducer(s, { type: "forage", resource: "roots" });
    expect(s2.phase).toBe("forage"); // unchanged
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("season changes after DAYS_PER_SEASON days", () => {
    let s = initialState(42);
    for (let i = 0; i < DAYS_PER_SEASON; i++) {
      s = reducer(s, { type: "rest" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.seasonIdx).toBe(1);
    expect(s.day).toBe(1);
  });

  it("completes all seasons", () => {
    let s = initialState(42);
    for (let season = 0; season < TOTAL_SEASONS; season++) {
      for (let day = 0; day < DAYS_PER_SEASON; day++) {
        s = reducer(s, { type: "rest" });
        s = reducer(s, { type: "nextDay" });
      }
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
