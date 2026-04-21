import type { Card, Rank } from "./index.js";

export type HandClass =
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "one-pair"
  | "high-card";

export interface RankedHand {
  class: HandClass;
  // ordered tiebreakers, high-to-low
  kickers: number[];
}

const HIGH = (r: Rank): number => (r === 1 ? 14 : r);

export function rankHand(cards: Card[]): RankedHand {
  if (cards.length !== 5) throw new Error("rankHand expects 5 cards");
  const ranks = cards.map((c) => HIGH(c.rank)).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  const countsMap = new Map<number, number>();
  for (const r of ranks) countsMap.set(r, (countsMap.get(r) ?? 0) + 1);
  const groups = [...countsMap.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const counts = groups.map((g) => g[1]);

  // Straight detection: either 5 consecutive OR wheel (A-2-3-4-5 → treat ace as 1)
  const uniq = [...new Set(ranks)];
  let isStraight = false;
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0]! - uniq[4]! === 4) {
      isStraight = true;
      straightHigh = uniq[0]!;
    } else if (uniq[0] === 14 && uniq[1] === 5 && uniq[4] === 2) {
      isStraight = true;
      straightHigh = 5;
    }
  }

  if (isStraight && isFlush) return { class: "straight-flush", kickers: [straightHigh] };
  if (counts[0] === 4) return { class: "four-of-a-kind", kickers: [groups[0]![0], groups[1]![0]] };
  if (counts[0] === 3 && counts[1] === 2) return { class: "full-house", kickers: [groups[0]![0], groups[1]![0]] };
  if (isFlush) return { class: "flush", kickers: ranks };
  if (isStraight) return { class: "straight", kickers: [straightHigh] };
  if (counts[0] === 3) return { class: "three-of-a-kind", kickers: [groups[0]![0], ...groups.slice(1).map((g) => g[0])] };
  if (counts[0] === 2 && counts[1] === 2) {
    const [a, b] = [groups[0]![0], groups[1]![0]];
    const high = Math.max(a, b), low = Math.min(a, b);
    return { class: "two-pair", kickers: [high, low, groups[2]![0]] };
  }
  if (counts[0] === 2) return { class: "one-pair", kickers: [groups[0]![0], ...groups.slice(1).map((g) => g[0])] };
  return { class: "high-card", kickers: ranks };
}
