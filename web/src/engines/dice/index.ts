export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;
export interface Die { value: DieFace; kept: boolean }

export function rollDice(n: number, rng: () => number): Die[] {
  const out: Die[] = [];
  for (let i = 0; i < n; i++) {
    const v = (Math.floor(rng() * 6) + 1) as DieFace;
    out.push({ value: v, kept: false });
  }
  return out;
}

export function rerollUnkept(dice: readonly Die[], rng: () => number): Die[] {
  return dice.map((d) =>
    d.kept ? d : { value: (Math.floor(rng() * 6) + 1) as DieFace, kept: false },
  );
}

export function toggleKeep(dice: readonly Die[], index: number): Die[] {
  return dice.map((d, i) => (i === index ? { ...d, kept: !d.kept } : d));
}

export function faceCounts(dice: readonly Die[]): Record<DieFace, number> {
  const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<DieFace, number>;
  for (const d of dice) c[d.value]++;
  return c;
}

/* ======== Yahtzee-style scorers ======== */

/** Sum of dice showing the given face. Upper section categories. */
export function scoreOfAKindUpper(dice: readonly Die[], face: DieFace): number {
  return dice.filter((d) => d.value === face).length * face;
}

/** Sum of all dice, iff we have at least N of any face. Else 0. */
export function scoreNOfAKind(dice: readonly Die[], n: number): number {
  const c = faceCounts(dice);
  if (Object.values(c).some((count) => count >= n)) {
    return dice.reduce((s, d) => s + d.value, 0);
  }
  return 0;
}

/** Full house: 3 + 2 of different faces → 25. Else 0. */
export function scoreFullHouse(dice: readonly Die[]): number {
  const counts = Object.values(faceCounts(dice));
  const has3 = counts.includes(3);
  const has2 = counts.includes(2);
  return has3 && has2 ? 25 : 0;
}

/** Small straight (4 consecutive) → 30. Else 0. */
export function scoreSmallStraight(dice: readonly Die[]): number {
  const set = new Set(dice.map((d) => d.value));
  const runs = [[1,2,3,4],[2,3,4,5],[3,4,5,6]];
  return runs.some((r) => r.every((v) => set.has(v as DieFace))) ? 30 : 0;
}

/** Large straight (5 consecutive) → 40. Else 0. */
export function scoreLargeStraight(dice: readonly Die[]): number {
  const set = new Set(dice.map((d) => d.value));
  const runs = [[1,2,3,4,5],[2,3,4,5,6]];
  return runs.some((r) => r.every((v) => set.has(v as DieFace))) ? 40 : 0;
}

/** Yahtzee (5 of a kind) → 50. Else 0. */
export function scoreYahtzee(dice: readonly Die[]): number {
  const c = faceCounts(dice);
  return Object.values(c).some((count) => count >= 5) ? 50 : 0;
}

/** Chance: sum of all dice. */
export function scoreChance(dice: readonly Die[]): number {
  return dice.reduce((s, d) => s + d.value, 0);
}

/* ======== Farkle scorers ======== */

/**
 * Score a given set of dice values using Farkle rules.
 * Returns the total score for the combination, or 0 if any die is unscorable
 * (i.e., this pick isn't a valid set-aside because it contains a non-scoring die).
 */
export function scoreFarkleSelection(values: readonly DieFace[]): number {
  if (values.length === 0) return 0;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<DieFace, number>;
  for (const v of values) counts[v]++;

  // Straight 1-6 using exactly 6 dice
  if (values.length === 6 && Object.values(counts).every((c) => c === 1)) return 1500;

  // Three pairs using exactly 6 dice
  if (values.length === 6) {
    const pairs = Object.values(counts).filter((c) => c === 2).length;
    if (pairs === 3) return 1500;
    // Four of a kind + pair
    const four = (Object.values(counts) as number[]).findIndex((c) => c === 4);
    const two = (Object.values(counts) as number[]).findIndex((c) => c === 2);
    if (four >= 0 && two >= 0) return 1500;
  }

  let total = 0;
  let used = 0;
  for (const face of [1, 2, 3, 4, 5, 6] as DieFace[]) {
    const n = counts[face];
    if (n >= 3) {
      const base = face === 1 ? 1000 : face * 100;
      total += base * Math.pow(2, n - 3); // 3→x1, 4→x2, 5→x4, 6→x8
      used += n;
    }
  }
  // Individual 1s and 5s outside of triples
  const remainingOnes = counts[1] < 3 ? counts[1] : 0;
  const remainingFives = counts[5] < 3 ? counts[5] : 0;
  total += remainingOnes * 100;
  total += remainingFives * 50;
  used += remainingOnes + remainingFives;

  // If any unscored dice remain, the selection is invalid
  if (used < values.length) return 0;
  return total;
}

/** True if the given roll can produce any scoring set-aside. */
export function hasFarkleScoringOption(dice: readonly Die[]): boolean {
  // A roll has NO scoring option if it contains no 1s, no 5s, no triples, no straight, no 3 pairs.
  // Quick check: try scoring each face count.
  const values = dice.map((d) => d.value);
  if (scoreFarkleSelection(values) > 0) return true;
  for (const v of values) if (scoreFarkleSelection([v]) > 0) return true;
  return false;
}
