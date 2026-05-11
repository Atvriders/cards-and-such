import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { mulberry32, useSeededRng } from "./useSeededRng";

describe("mulberry32", () => {
  it("produces a deterministic sequence for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
    // Values should be valid floats in [0, 1)
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).not.toEqual(seqB);
  });
});

describe("useSeededRng", () => {
  it("returns a stable rng across rerenders with the same seed and a new one when seed changes", () => {
    const { result, rerender } = renderHook(
      ({ seed }: { seed: number }) => useSeededRng(seed),
      { initialProps: { seed: 7 } },
    );

    const rngFirst = result.current;
    const firstValue = rngFirst();

    rerender({ seed: 7 });
    expect(result.current).toBe(rngFirst);

    rerender({ seed: 8 });
    const rngSecond = result.current;
    expect(rngSecond).not.toBe(rngFirst);

    // A freshly seeded rng with seed=8 should start fresh, not continue rngFirst's stream
    const expectedFromFreshSeed8 = mulberry32(8)();
    expect(rngSecond()).toBe(expectedFromFreshSeed8);
    expect(typeof firstValue).toBe("number");
  });
});
