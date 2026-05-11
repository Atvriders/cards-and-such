import { describe, expect, it } from "vitest";
import { bcValue, bcTotal, drawC, resolveBaccarat, makeRng } from "./baccarat-engine.js";

/** Deterministic stub RNG that yields a known sequence in [0, 1). */
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[i % values.length];
    i++;
    return v;
  };
}

describe("baccarat-engine", () => {
  it("bcValue assigns Ace=1, 2-9=face, 10/J/Q/K=0 across all four suits", () => {
    // Cards 0..51, rank = card % 13. r=0 → A, r=1..8 → 2..9, r=9..12 → 10/J/Q/K.
    for (let suit = 0; suit < 4; suit++) {
      const base = suit * 13;
      expect(bcValue(base + 0)).toBe(1);   // Ace
      expect(bcValue(base + 1)).toBe(2);   // 2
      expect(bcValue(base + 8)).toBe(9);   // 9
      expect(bcValue(base + 9)).toBe(0);   // 10
      expect(bcValue(base + 10)).toBe(0);  // J
      expect(bcValue(base + 11)).toBe(0);  // Q
      expect(bcValue(base + 12)).toBe(0);  // K
    }
    // bcTotal sums values mod 10: 7 + 8 + 9 = 24 % 10 = 4.
    expect(bcTotal([6, 7, 8])).toBe(4);
    // Face cards contribute 0; mod-10 wrap: 9 + 9 = 18 → 8.
    expect(bcTotal([8, 8, 9, 22])).toBe(8); // 9 + 9 + 0 (10) + 0 (10) = 18 → 8
  });

  it("drawC never returns a card already in `used` and registers what it draws", () => {
    // Force first random pick to 0 (already used). Second pick lands on 5.
    const used = new Set<number>([0, 1, 2, 3, 4]);
    const rng = seqRng([0.0, 0.1]); // 0.0*52=0 (used), 0.1*52=5.2→5
    const c = drawC(rng, used);
    expect(c).toBe(5);
    expect(used.has(5)).toBe(true);
    // Calling again with same RNG sequence: 0.0 → 0 used, 0.1 → 5 now used, so
    // the helper keeps polling. Provide an extra fresh value that lands on 7.
    const rng2 = seqRng([0.0, 0.1, 0.15]); // 7.8 → 7
    const c2 = drawC(rng2, used);
    expect(c2).toBe(7);
    expect(used.has(7)).toBe(true);
  });

  it("resolveBaccarat with a deterministic RNG returns a coherent, rule-valid round", () => {
    const { rng } = makeRng(12345);
    const used = new Set<number>();
    const result = resolveBaccarat(rng, used);

    // Hand sizes must be 2 or 3 (third-card rule).
    expect(result.player.length).toBeGreaterThanOrEqual(2);
    expect(result.player.length).toBeLessThanOrEqual(3);
    expect(result.banker.length).toBeGreaterThanOrEqual(2);
    expect(result.banker.length).toBeLessThanOrEqual(3);

    // No duplicate cards between hands or within hands.
    const allCards = [...result.player, ...result.banker];
    expect(new Set(allCards).size).toBe(allCards.length);

    // Every drawn card was registered in `used`.
    for (const c of allCards) expect(used.has(c)).toBe(true);

    // Totals are 0..9 and match bcTotal of the recorded hands.
    expect(result.pTotal).toBe(bcTotal(result.player));
    expect(result.bTotal).toBe(bcTotal(result.banker));
    expect(result.pTotal).toBeGreaterThanOrEqual(0);
    expect(result.pTotal).toBeLessThanOrEqual(9);
    expect(result.bTotal).toBeGreaterThanOrEqual(0);
    expect(result.bTotal).toBeLessThanOrEqual(9);

    // Outcome is consistent with totals.
    if (result.pTotal > result.bTotal) expect(result.outcome).toBe("player");
    else if (result.bTotal > result.pTotal) expect(result.outcome).toBe("banker");
    else expect(result.outcome).toBe("tie");

    // makeRng is deterministic: same seed → same outcome.
    const replay = resolveBaccarat(makeRng(12345).rng, new Set<number>());
    expect(replay).toEqual(result);
  });
});
