import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy60 = { duration: "60" as const, difficulty: "easy" as const };
const hard30 = { duration: "30" as const, difficulty: "hard" as const };

describe("TargetPractice initialState", () => {
  it("starts with no targets, score 0, not ended", () => {
    const s = initialState(42, easy60);
    expect(s.targets.length).toBe(0);
    expect(s.score).toBe(0);
    expect(s.ended).toBe(false);
    expect(s.elapsed).toBe(0);
  });

  it("same seed produces same initial state", () => {
    const s1 = initialState(99, easy60);
    const s2 = initialState(99, easy60);
    expect(s1.rngSeed).toBe(s2.rngSeed);
    expect(s1.score).toBe(s2.score);
  });
});

describe("TargetPractice tick", () => {
  it("advances elapsed", () => {
    const s = initialState(42, easy60);
    const s2 = reducer(s, { type: "tick", dt: 2 });
    expect(s2.elapsed).toBeCloseTo(2);
  });

  it("spawns targets after enough time", () => {
    const s = initialState(42, easy60);
    // Easy spawns every 1.5s; tick 3 seconds
    const s2 = reducer(s, { type: "tick", dt: 3 });
    expect(s2.targets.length).toBeGreaterThan(0);
  });

  it("ends game at duration", () => {
    const s = initialState(42, hard30);
    const s2 = reducer(s, { type: "tick", dt: 30 });
    expect(s2.ended).toBe(true);
  });

  it("no more ticks after ended", () => {
    const s = initialState(42, hard30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30);
  });
});

describe("TargetPractice hit and miss", () => {
  it("hitting a valid target increases score", () => {
    const s = initialState(42, easy60);
    const withTarget = reducer(s, { type: "tick", dt: 2 });
    if (withTarget.targets.length === 0) return; // no targets yet
    const firstId = withTarget.targets[0]!.id;
    const afterHit = reducer(withTarget, { type: "hit", id: firstId });
    expect(afterHit.score).toBeGreaterThan(0);
    expect(afterHit.targets.find((t) => t.id === firstId)).toBeUndefined();
  });

  it("hitting invalid id is a no-op", () => {
    const s = initialState(42, easy60);
    const s2 = reducer(s, { type: "hit", id: 9999 });
    expect(s2.score).toBe(0);
  });

  it("miss decrements score by 1 (min 0)", () => {
    const s = initialState(42, easy60);
    const s2 = reducer(s, { type: "miss" });
    expect(s2.score).toBe(0); // clamped at 0
    expect(s2.misses).toBe(1);
  });

  it("miss after scoring reduces score", () => {
    const s = initialState(42, easy60);
    const withTarget = reducer(s, { type: "tick", dt: 2 });
    if (withTarget.targets.length === 0) return;
    const firstId = withTarget.targets[0]!.id;
    const afterHit = reducer(withTarget, { type: "hit", id: firstId });
    const afterMiss = reducer(afterHit, { type: "miss" });
    expect(afterMiss.score).toBe(afterHit.score - 1);
  });
});

describe("TargetPractice isTerminal", () => {
  it("returns null while running", () => {
    const s = initialState(42, easy60);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when ended", () => {
    const s = initialState(42, hard30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(isTerminal(ended)).not.toBeNull();
    expect(typeof isTerminal(ended)?.score).toBe("number");
  });
});
