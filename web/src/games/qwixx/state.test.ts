import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcScore } from "./state.js";
import type { QwixxState } from "./state.js";

const settings = { mode: "normal" as const };

describe("Qwixx initialState", () => {
  it("starts in preRoll with no marks and no penalties", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("preRoll");
    expect(s.penalties).toBe(0);
    expect(s.checked.red.every((v) => !v)).toBe(true);
    expect(s.checked.blue.every((v) => !v)).toBe(true);
  });

  it("is deterministic", () => {
    expect(initialState(17, settings)).toEqual(initialState(17, settings));
  });
});

describe("Qwixx roll", () => {
  it("roll produces dice values 1-6", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("rolled");
    expect(s2.whiteDice[0]).toBeGreaterThanOrEqual(1);
    expect(s2.whiteDice[1]).toBeGreaterThanOrEqual(1);
    for (const c of ["red", "yellow", "blue", "green"] as const) {
      expect(s2.colorDice[c]).toBeGreaterThanOrEqual(1);
      expect(s2.colorDice[c]).toBeLessThanOrEqual(6);
    }
  });

  it("roll is no-op when not in preRoll", () => {
    const s = initialState(5, settings);
    const rolled = reducer(s, { type: "roll" });
    const again = reducer(rolled, { type: "roll" });
    expect(again).toBe(rolled);
  });
});

describe("Qwixx takePenalty", () => {
  it("penalty increments and returns to preRoll", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "takePenalty" });
    expect(s3.penalties).toBe(1);
    expect(s3.phase).toBe("preRoll");
  });

  it("4 penalties ends the game", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 4; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "takePenalty" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("Qwixx calcScore", () => {
  it("zero marks = 0 score", () => {
    const s = initialState(1, settings);
    expect(calcScore(s)).toBe(0);
  });

  it("penalties subtract from score", () => {
    const s = initialState(1, settings);
    const withPenalty: QwixxState = { ...s, penalties: 2 };
    expect(calcScore(withPenalty)).toBe(-10);
  });
});

describe("Qwixx isTerminal", () => {
  it("null when not done", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns non-null when done", () => {
    const s = initialState(1, settings);
    const done: QwixxState = { ...s, phase: "done" };
    expect(isTerminal(done)).not.toBeNull();
  });
});
