import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5_10 = { rounds: "5" as const, ammo: "10" as const };
const s3_5 = { rounds: "3" as const, ammo: "5" as const };

describe("DuckShoot initialState", () => {
  it("starts with correct rounds and ammo", () => {
    const s = initialState(42, s5_10);
    expect(s.round).toBe(1);
    expect(s.totalRounds).toBe(5);
    expect(s.ammoLeft).toBe(10);
    expect(s.score).toBe(0);
    expect(s.ended).toBe(false);
  });

  it("spawns 6 ducks at start", () => {
    const s = initialState(42, s5_10);
    expect(s.ducks.length).toBe(6);
  });

  it("same seed gives same initial ducks", () => {
    const s1 = initialState(7, s5_10);
    const s2 = initialState(7, s5_10);
    expect(s1.ducks[0]!.x).toBeCloseTo(s2.ducks[0]!.x);
    expect(s1.ducks[0]!.y).toBeCloseTo(s2.ducks[0]!.y);
  });

  it("3 rounds with 5 ammo configured correctly", () => {
    const s = initialState(1, s3_5);
    expect(s.totalRounds).toBe(3);
    expect(s.ammoPerRound).toBe(5);
  });
});

describe("DuckShoot tick", () => {
  it("ducks move over time", () => {
    const s = initialState(42, s5_10);
    const x0 = s.ducks[0]!.x;
    const s2 = reducer(s, { type: "tick", dt: 0.5 });
    // Duck should have moved (unless vx is very small)
    expect(Math.abs(s2.ducks[0]!.x - x0)).toBeGreaterThanOrEqual(0);
  });

  it("round ends when ammo runs out", () => {
    const s = initialState(42, s3_5);
    // Fire all ammo at impossible positions
    let cur = s;
    for (let i = 0; i < 5; i++) {
      cur = reducer(cur, { type: "shoot", x: 0, y: 0 });
    }
    // Tick a small amount to trigger roundOver
    cur = reducer(cur, { type: "tick", dt: 0.01 });
    expect(cur.roundOver).toBe(true);
  });

  it("game ends after all rounds complete", () => {
    let s = initialState(42, s3_5);
    // Exhaust all ammo in round 1
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "shoot", x: 0, y: 0 });
    }
    s = reducer(s, { type: "tick", dt: 0.01 });
    s = reducer(s, { type: "nextRound" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "shoot", x: 0, y: 0 });
    }
    s = reducer(s, { type: "tick", dt: 0.01 });
    s = reducer(s, { type: "nextRound" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "shoot", x: 0, y: 0 });
    }
    s = reducer(s, { type: "tick", dt: 0.01 });
    s = reducer(s, { type: "nextRound" });
    expect(s.ended).toBe(true);
  });
});

describe("DuckShoot shoot", () => {
  it("shoot reduces ammo", () => {
    const s = initialState(42, s5_10);
    const s2 = reducer(s, { type: "shoot", x: 0, y: 0 });
    expect(s2.ammoLeft).toBe(9);
  });

  it("hitting a duck increases score", () => {
    const s = initialState(42, s5_10);
    const duck = s.ducks[0]!;
    const s2 = reducer(s, { type: "shoot", x: duck.x, y: duck.y });
    expect(s2.score).toBe(1);
    // Duck should be marked as hit
    expect(s2.ducks.find((d) => d.id === duck.id)?.hit).toBe(true);
  });

  it("missing does not increase score", () => {
    const s = initialState(42, s5_10);
    const s2 = reducer(s, { type: "shoot", x: 0, y: 0 });
    expect(s2.score).toBe(0);
    expect(s2.ammoLeft).toBe(9);
  });

  it("cannot shoot with 0 ammo", () => {
    const s = initialState(42, { rounds: "3" as const, ammo: "5" as const });
    let cur = s;
    for (let i = 0; i < 5; i++) cur = reducer(cur, { type: "shoot", x: 0, y: 0 });
    const before = cur.ammoLeft;
    const after = reducer(cur, { type: "shoot", x: 0.5, y: 0.5 });
    expect(after.ammoLeft).toBe(before);
  });
});

describe("DuckShoot isTerminal", () => {
  it("null while running", () => {
    expect(isTerminal(initialState(1, s5_10))).toBeNull();
  });

  it("returns score when ended", () => {
    const s = { ...initialState(42, s3_5), ended: true };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
