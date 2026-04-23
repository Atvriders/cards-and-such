import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_THROWS } from "./state.js";

const settings = { dummy: true };

describe("PaperToss initialState", () => {
  it("starts in aiming phase with angle=90, power=60", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("aiming");
    expect(s.angle).toBe(90);
    expect(s.power).toBe(60);
    expect(s.throwIndex).toBe(0);
    expect(s.throws.length).toBe(0);
    expect(s.winds.length).toBe(TOTAL_THROWS);
  });

  it("is deterministic for the same seed", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("PaperToss sliders", () => {
  it("setAngle updates angle", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "setAngle", value: 60 });
    expect(s2.angle).toBe(60);
  });

  it("setPower updates power", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "setPower", value: 80 });
    expect(s2.power).toBe(80);
  });

  it("angle is clamped to 30-150", () => {
    const s = initialState(1, settings);
    expect(reducer(s, { type: "setAngle", value: 0 }).angle).toBe(30);
    expect(reducer(s, { type: "setAngle", value: 200 }).angle).toBe(150);
  });
});

describe("PaperToss throw action", () => {
  it("throw transitions to thrown phase", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.phase).toBe("thrown");
    expect(s2.throws.length).toBe(1);
  });

  it("ideal angle+power with no wind hits the basket", () => {
    const s = initialState(1, settings);
    // Override wind to 0 for deterministic test
    const noWind = { ...s, winds: [0, ...s.winds.slice(1)] };
    const s2 = reducer(noWind, { type: "throw" }); // angle=90, power=60, wind=0
    expect(s2.throws[0]!.hit).toBe(true);
  });

  it("completes after 10 throws", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < TOTAL_THROWS; i++) {
      s = reducer(s, { type: "throw" });
      if (s.phase === "thrown") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("PaperToss terminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, score: 50 };
    expect(isTerminal(done)!.score).toBe(50);
  });
});
