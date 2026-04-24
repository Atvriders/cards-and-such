import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calculatePayout } from "./state.js";

const defaultSettings = { roundsPerSession: 15, bet: "10" as const, spotsToPlay: "5" as const };

describe("KenoMini calculatePayout", () => {
  it("pays 350x for 5/5 hit", () => {
    expect(calculatePayout(5, 5, 10)).toBe(3500);
  });
  it("pays 0 for 1/5 hit", () => {
    expect(calculatePayout(5, 1, 10)).toBe(0);
  });
  it("pays 3x for 1/1 hit", () => {
    expect(calculatePayout(1, 1, 10)).toBe(30);
  });
  it("pays 12x for 2/2", () => {
    expect(calculatePayout(2, 2, 10)).toBe(120);
  });
});

describe("KenoMini initialState", () => {
  it("starts with 1000 bankroll in picking phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("picking");
    expect(s.picked).toHaveLength(0);
  });
});

describe("KenoMini pick/unpick", () => {
  it("adds number to picked list", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "pick", number: 7 });
    expect(s2.picked).toContain(7);
  });

  it("cannot pick more than spotsToPlay", () => {
    let s = initialState(42, defaultSettings);
    for (const n of [1,2,3,4,5]) s = reducer(s, { type: "pick", number: n });
    const s2 = reducer(s, { type: "pick", number: 6 });
    expect(s2.picked).toHaveLength(5); // capped
  });

  it("unpick removes number", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "pick", number: 10 });
    const s3 = reducer(s2, { type: "unpick", number: 10 });
    expect(s3.picked).not.toContain(10);
  });
});

describe("KenoMini draw", () => {
  it("draws 10 numbers and enters settled phase", () => {
    let s = initialState(42, defaultSettings);
    for (const n of [1,2,3,4,5]) s = reducer(s, { type: "pick", number: n });
    const s2 = reducer(s, { type: "draw" });
    expect(s2.phase).toBe("settled");
    expect(s2.drawn).toHaveLength(10);
    expect(s2.roundsPlayed).toBe(1);
    expect(s2.bankroll).toBeLessThanOrEqual(1000); // at minimum loses bet unless big win
  });
});

describe("KenoMini isTerminal", () => {
  it("terminal when rounds complete", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, roundsPlayed: 15, bankroll: 600 };
    expect(isTerminal(end)?.score).toBe(600);
  });

  it("not terminal early", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
