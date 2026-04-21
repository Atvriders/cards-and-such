import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CrapsState } from "./state.js";

const defaultSettings = { rounds: "10" as const, betSize: "25" as const };

describe("initialState", () => {
  it("starts with $1000 and come-out phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.roundsPlayed).toBe(0);
    expect(s.phase).toBe("come-out");
    expect(s.point).toBeNull();
  });
});

describe("come-out roll", () => {
  it("natural 7 or 11 wins pass line", () => {
    // Run many seeds to find a natural
    let foundNatural = false;
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.lastRoll) {
        const total = s2.lastRoll[0] + s2.lastRoll[1];
        if (total === 7 || total === 11) {
          expect(s2.bankroll).toBeGreaterThan(1000 - 25); // win or push
          expect(s2.phase).toBe("settled");
          expect(s2.roundsPlayed).toBe(1);
          foundNatural = true;
          break;
        }
      }
    }
    expect(foundNatural).toBe(true);
  });

  it("craps 2, 3, or 12 loses pass line", () => {
    let foundCraps = false;
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.lastRoll) {
        const total = s2.lastRoll[0] + s2.lastRoll[1];
        if (total === 2 || total === 3 || total === 12) {
          expect(s2.bankroll).toBeLessThan(1000);
          expect(s2.phase).toBe("settled");
          expect(s2.roundsPlayed).toBe(1);
          foundCraps = true;
          break;
        }
      }
    }
    expect(foundCraps).toBe(true);
  });

  it("4/5/6/8/9/10 sets a point", () => {
    let foundPoint = false;
    for (let seed = 0; seed < 100; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = reducer(s, { type: "roll" });
      if (s2.phase === "point") {
        expect(s2.point).not.toBeNull();
        expect([4, 5, 6, 8, 9, 10]).toContain(s2.point);
        expect(s2.roundsPlayed).toBe(0); // round not over yet
        foundPoint = true;
        break;
      }
    }
    expect(foundPoint).toBe(true);
  });
});

describe("point phase", () => {
  it("making the point wins", () => {
    // Build a point phase state
    const s = initialState(42, defaultSettings);
    const pointState: CrapsState = {
      ...s,
      phase: "point",
      point: 6,
      bankroll: 975, // already deducted bet
    };
    // Find seed that rolls 6
    let won = false;
    for (let seed = 0; seed < 500; seed++) {
      const s2 = reducer({ ...pointState, rngSeed: seed }, { type: "roll" });
      if (s2.lastRoll && (s2.lastRoll[0] + s2.lastRoll[1]) === 6) {
        expect(s2.bankroll).toBeGreaterThan(pointState.bankroll);
        expect(s2.phase).toBe("settled");
        expect(s2.roundsPlayed).toBe(1);
        won = true;
        break;
      }
    }
    expect(won).toBe(true);
  });

  it("seven out loses", () => {
    const s = initialState(42, defaultSettings);
    const pointState: CrapsState = {
      ...s,
      phase: "point",
      point: 4,
      bankroll: 975,
    };
    let lost = false;
    for (let seed = 0; seed < 500; seed++) {
      const s2 = reducer({ ...pointState, rngSeed: seed }, { type: "roll" });
      if (s2.lastRoll && (s2.lastRoll[0] + s2.lastRoll[1]) === 7) {
        expect(s2.bankroll).toBeLessThanOrEqual(pointState.bankroll);
        expect(s2.phase).toBe("settled");
        lost = true;
        break;
      }
    }
    expect(lost).toBe(true);
  });

  it("non-point non-7 keeps rolling", () => {
    const s = initialState(42, defaultSettings);
    const pointState: CrapsState = {
      ...s,
      phase: "point",
      point: 10,
      bankroll: 975,
    };
    // roll that's neither 10 nor 7
    let midroll = false;
    for (let seed = 0; seed < 500; seed++) {
      const s2 = reducer({ ...pointState, rngSeed: seed }, { type: "roll" });
      if (s2.lastRoll) {
        const total = s2.lastRoll[0] + s2.lastRoll[1];
        if (total !== 10 && total !== 7) {
          expect(s2.phase).toBe("point");
          expect(s2.roundsPlayed).toBe(0);
          midroll = true;
          break;
        }
      }
    }
    expect(midroll).toBe(true);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when rounds exhausted", () => {
    const s = initialState(42, defaultSettings);
    const done: CrapsState = { ...s, phase: "settled", roundsPlayed: 10, bankroll: 900 };
    expect(isTerminal(done)).toEqual({ score: 900 });
  });

  it("terminal when bankroll depleted", () => {
    const s = initialState(42, defaultSettings);
    const broke: CrapsState = { ...s, phase: "settled", roundsPlayed: 3, bankroll: 0 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });

  it("not terminal in point phase even if rounds met", () => {
    const s = initialState(42, defaultSettings);
    // While in a point, we don't terminate (midroll)
    const pointState: CrapsState = { ...s, phase: "point", roundsPlayed: 10, bankroll: 900 };
    expect(isTerminal(pointState)).toBeNull();
  });
});
