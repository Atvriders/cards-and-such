import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s60med = { duration: "60" as const, flySpeed: "medium" as const };
const s30fast = { duration: "30" as const, flySpeed: "fast" as const };

describe("FrogCatcher initialState", () => {
  it("starts with no flies, no tongue, score 0", () => {
    const s = initialState(42, s60med);
    expect(s.flies.length).toBe(0);
    expect(s.tongue).toBeNull();
    expect(s.score).toBe(0);
    expect(s.ended).toBe(false);
  });

  it("frog is positioned on lily pad", () => {
    const s = initialState(1, s60med);
    expect(s.frog.x).toBeCloseTo(0.5);
    expect(s.frog.y).toBeGreaterThan(0.5);
  });

  it("same seed gives same initial position", () => {
    const s1 = initialState(99, s60med);
    const s2 = initialState(99, s60med);
    expect(s1.frog.x).toBe(s2.frog.x);
    expect(s1.frog.y).toBe(s2.frog.y);
  });
});

describe("FrogCatcher tick", () => {
  it("advances elapsed", () => {
    const s = initialState(42, s60med);
    const s2 = reducer(s, { type: "tick", dt: 1 });
    expect(s2.elapsed).toBeCloseTo(1);
  });

  it("spawns flies after some time", () => {
    const s = initialState(42, s60med);
    const s2 = reducer(s, { type: "tick", dt: 2 });
    expect(s2.flies.length).toBeGreaterThan(0);
  });

  it("ends game at duration", () => {
    const s = initialState(42, s30fast);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(ended.ended).toBe(true);
  });

  it("no tick after ended", () => {
    const s = initialState(42, s30fast);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30);
  });
});

describe("FrogCatcher extend tongue", () => {
  it("extend creates tongue toward target", () => {
    const s = initialState(42, s60med);
    const s2 = reducer(s, { type: "extend", tx: 0.5, ty: 0.3 });
    expect(s2.tongue).not.toBeNull();
    expect(s2.tongue?.tx).toBeCloseTo(0.5);
    expect(s2.tongue?.ty).toBeCloseTo(0.3);
    expect(s2.tongue?.progress).toBe(0);
    expect(s2.tongue?.retracting).toBe(false);
  });

  it("cannot extend while tongue is active", () => {
    const s = initialState(42, s60med);
    const s2 = reducer(s, { type: "extend", tx: 0.5, ty: 0.3 });
    const s3 = reducer(s2, { type: "extend", tx: 0.8, ty: 0.1 });
    // Target should not have changed
    expect(s3.tongue?.tx).toBeCloseTo(0.5);
  });

  it("tongue advances during tick", () => {
    const s = initialState(42, s60med);
    const s2 = reducer(s, { type: "extend", tx: 0.5, ty: 0.1 });
    const s3 = reducer(s2, { type: "tick", dt: 0.2 });
    expect(s3.tongue?.progress).toBeGreaterThan(0);
  });

  it("catching a fly at tongue tip increments score", () => {
    const s = initialState(42, s60med);
    // Inject a fly at the target position
    const fly = { id: 0, x: 0.5, y: 0.3, vx: 0, vy: 0 };
    const withFly = { ...s, flies: [fly], nextId: 1 };
    // Extend tongue directly at fly
    const s2 = reducer(withFly, { type: "extend", tx: 0.5, ty: 0.3 });
    // Tick enough to reach the fly (progress → 1 requires ~0.4s at speed 2.5)
    const s3 = reducer(s2, { type: "tick", dt: 0.5 });
    expect(s3.score).toBe(1);
    expect(s3.flies.length).toBe(0);
  });
});

describe("FrogCatcher isTerminal", () => {
  it("null while running", () => {
    expect(isTerminal(initialState(1, s60med))).toBeNull();
  });

  it("returns score when ended", () => {
    const s = initialState(42, s30fast);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(isTerminal(ended)).not.toBeNull();
    expect(typeof isTerminal(ended)?.score).toBe("number");
  });
});
