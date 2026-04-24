import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcScore } from "./state.js";

const settings10Med = { targets: "10" as const, difficulty: "medium" as const };
const settings20Easy = { targets: "20" as const, difficulty: "easy" as const };

describe("AimTrainer initialState", () => {
  it("starts with no target, 0 hit, not ended", () => {
    const s = initialState(42, settings10Med);
    expect(s.target).toBeNull();
    expect(s.hit).toBe(0);
    expect(s.ended).toBe(false);
  });

  it("totalTargets matches settings", () => {
    const s = initialState(42, settings10Med);
    expect(s.totalTargets).toBe(10);
    const s2 = initialState(42, settings20Easy);
    expect(s2.totalTargets).toBe(20);
  });

  it("same seed produces same first target position", () => {
    let s1 = initialState(7, settings10Med);
    let s2 = initialState(7, settings10Med);
    s1 = reducer(s1, { type: "spawn", now: 1000 });
    s2 = reducer(s2, { type: "spawn", now: 1000 });
    expect(s1.target?.x).toBeCloseTo(s2.target?.x ?? 0);
    expect(s1.target?.y).toBeCloseTo(s2.target?.y ?? 0);
  });
});

describe("AimTrainer spawn", () => {
  it("spawn creates a target", () => {
    const s = initialState(42, settings10Med);
    const s2 = reducer(s, { type: "spawn", now: 1000 });
    expect(s2.target).not.toBeNull();
    expect(s2.target?.spawnedAt).toBe(1000);
  });

  it("spawn does nothing when target already exists", () => {
    const s = initialState(42, settings10Med);
    const s2 = reducer(s, { type: "spawn", now: 1000 });
    const s3 = reducer(s2, { type: "spawn", now: 2000 });
    expect(s3.target?.spawnedAt).toBe(1000); // unchanged
  });
});

describe("AimTrainer hit and miss", () => {
  it("hit increments hit count and records reaction time", () => {
    const s = initialState(42, settings10Med);
    const s2 = reducer(s, { type: "spawn", now: 1000 });
    const id = s2.target!.id;
    const s3 = reducer(s2, { type: "hit", targetId: id, now: 1300 });
    expect(s3.hit).toBe(1);
    expect(s3.reactionTimes[0]).toBe(300);
    expect(s3.target).toBeNull();
  });

  it("miss increments miss count", () => {
    const s = initialState(42, settings10Med);
    const s2 = reducer(s, { type: "spawn", now: 1000 });
    const s3 = reducer(s2, { type: "miss", now: 1500 });
    expect(s3.missed).toBe(1);
    expect(s3.target).toBeNull();
  });

  it("game ends after all targets resolved", () => {
    let s = initialState(42, settings10Med);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "spawn", now: i * 1000 });
      const id = s.target!.id;
      s = reducer(s, { type: "hit", targetId: id, now: i * 1000 + 300 });
    }
    expect(s.ended).toBe(true);
  });

  it("hit with wrong id does nothing", () => {
    const s = initialState(42, settings10Med);
    const s2 = reducer(s, { type: "spawn", now: 1000 });
    const s3 = reducer(s2, { type: "hit", targetId: 999, now: 1300 });
    expect(s3.hit).toBe(0);
    expect(s3.target).not.toBeNull();
  });
});

describe("AimTrainer isTerminal and calcScore", () => {
  it("returns null while running", () => {
    const s = initialState(42, settings10Med);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when ended", () => {
    const s = { ...initialState(42, settings10Med), ended: true };
    expect(isTerminal(s)).not.toBeNull();
  });

  it("calcScore is 0 with no hits", () => {
    const s = initialState(42, settings10Med);
    expect(calcScore(s)).toBe(0);
  });

  it("calcScore increases with hits and fast reactions", () => {
    const s = { ...initialState(42, settings10Med), hit: 10, missed: 0, reactionTimes: Array(10).fill(200) };
    expect(calcScore(s)).toBeGreaterThan(0);
  });
});
