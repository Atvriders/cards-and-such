import { describe, expect, it } from "vitest";
import {
  rollDie,
  rollDice,
  rollSum,
  nextSeed,
  rngFromSeed,
  bowlingFrame,
  proximityThrow,
  baseballAtBat,
  raceStep,
} from "./sim-engine.js";

/** Deterministic stub RNG that yields a known sequence in [0, 1). */
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[i % values.length]!;
    i++;
    return v;
  };
}

describe("sim-engine", () => {
  it("rollDie/rollDice/rollSum map RNG outputs into the inclusive 1..sides range", () => {
    // rng() = 0 → floor(0*6)=0 → 1; rng() = 0.999 → floor(5.99)=5 → 6
    expect(rollDie(seqRng([0]), 6)).toBe(1);
    expect(rollDie(seqRng([0.999]), 6)).toBe(6);
    // 0.5 on a d6 → 1 + floor(3) = 4
    expect(rollDie(seqRng([0.5]), 6)).toBe(4);
    // Custom sides honored
    expect(rollDie(seqRng([0.5]), 20)).toBe(11);

    // rollDice returns array of correct length, all faces 1..sides
    const dice = rollDice(seqRng([0, 0.25, 0.5, 0.75, 0.999]), 5, 6);
    expect(dice).toEqual([1, 2, 4, 5, 6]);

    // rollSum equals sum of those same rolls
    expect(rollSum(seqRng([0, 0.25, 0.5, 0.75, 0.999]), 5, 6)).toBe(1 + 2 + 4 + 5 + 6);
  });

  it("rngFromSeed is deterministic and bowlingFrame clamps to [0, maxPins]", () => {
    // Same seed → same sequence
    const a = rngFromSeed(42);
    const b = rngFromSeed(42);
    const seqA = [a.rng(), a.rng(), a.rng(), a.rng()];
    const seqB = [b.rng(), b.rng(), b.rng(), b.rng()];
    expect(seqA).toEqual(seqB);

    // advance() produces a deterministic non-negative int < 2^31
    const next = a.advance();
    expect(Number.isInteger(next)).toBe(true);
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(2 ** 31);

    // nextSeed contract: same as Math.floor(rng() * 2^31)
    const fixedRng = seqRng([0.5]);
    expect(nextSeed(fixedRng)).toBe(Math.floor(0.5 * 2 ** 31));

    // bowlingFrame: two d6 with rng()=0 give 1+1=2 → ((2-2)/10)*10 = 0 pins
    expect(bowlingFrame(seqRng([0, 0]), 10)).toBe(0);
    // rng()=0.999, 0.999 → 6+6=12 → ((12-2)/10)*10 = 10 pins (maxPins)
    expect(bowlingFrame(seqRng([0.999, 0.999]), 10)).toBe(10);
    // Result always within [0, maxPins] across many random rolls
    for (let i = 0; i < 50; i++) {
      const { rng } = rngFromSeed(1000 + i);
      const v = bowlingFrame(rng, 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it("proximityThrow shrinks with skill, baseballAtBat respects distribution, raceStep stays in [1, baseSpeed+4]", () => {
    // proximityThrow: skill=1 cuts base in half (rounded); base=floor(0.8*100)=80 → 80*0.5 = 40
    expect(proximityThrow(seqRng([0.8]), 1)).toBe(40);
    // skill=0 returns the raw base
    expect(proximityThrow(seqRng([0.8]), 0)).toBe(80);
    // Floor at 0
    expect(proximityThrow(seqRng([0]), 0.5)).toBe(0);

    // baseballAtBat edges: r=0 → strikeout; r=0.999 → home run
    expect(baseballAtBat(seqRng([0]), 0.5)).toBe("K");
    expect(baseballAtBat(seqRng([0.999]), 0.5)).toBe("HR");

    // raceStep = max(1, baseSpeed - 2 + d6); with rng=0 the die = 1 so baseSpeed-1
    // baseSpeed=4 → max(1, 4-2+1) = 3
    expect(raceStep(seqRng([0]), 4)).toBe(3);
    // With low baseSpeed, the max(1,...) floor kicks in: baseSpeed=1, die=1 → max(1, 0) = 1
    expect(raceStep(seqRng([0]), 1)).toBe(1);
    // Highest die: baseSpeed=4, rng=0.999 → die=6 → 4-2+6 = 8
    expect(raceStep(seqRng([0.999]), 4)).toBe(8);
  });
});
