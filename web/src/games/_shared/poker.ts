// Shared poker helpers used by Omaha, Stud, Pineapple, SDH, Razz, Badugi, OFC variants.
import type { Card } from "../../engines/deck/index.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export const CLASS_ORDER: HandClass[] = [
  "high-card",
  "one-pair",
  "two-pair",
  "three-of-a-kind",
  "straight",
  "flush",
  "full-house",
  "four-of-a-kind",
  "straight-flush",
];

export interface RankedHand {
  class: HandClass;
  kickers: number[];
}

export function compareHands(a: RankedHand, b: RankedHand): number {
  const r = CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class);
  if (r !== 0) return r;
  for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
    const d = (a.kickers[i] ?? 0) - (b.kickers[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** All 5-card subsets of `cards` */
function* combos<T>(arr: T[], k: number): Generator<T[]> {
  const n = arr.length;
  if (k > n) return;
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield idx.map((i) => arr[i]!);
    let i = k - 1;
    while (i >= 0 && idx[i] === i + n - k) i--;
    if (i < 0) return;
    idx[i]!++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1]! + 1;
  }
}

/** Best 5-card hand from any number >= 5 of cards. */
export function bestFive(cards: Card[]): RankedHand {
  if (cards.length < 5) {
    return { class: "high-card", kickers: [0] };
  }
  let best: RankedHand | null = null;
  for (const c5 of combos(cards, 5)) {
    const r = rankHand(c5);
    if (!best || compareHands(r, best) > 0) best = r;
  }
  return best!;
}

/** Omaha rule: best 5-card hand using EXACTLY 2 of `hole` and 3 of `community`. */
export function bestOmaha(hole: Card[], community: Card[]): RankedHand {
  let best: RankedHand | null = null;
  for (const h2 of combos(hole, 2)) {
    for (const c3 of combos(community, 3)) {
      const r = rankHand([...h2, ...c3]);
      if (!best || compareHands(r, best) > 0) best = r;
    }
  }
  return best ?? { class: "high-card", kickers: [0] };
}

// ─── Lowball (8-or-better A-5) ───
// In A-to-5 lowball, A is low, straights/flushes don't count against you, pairs do.
// A "qualifying" low requires 5 unique ranks all <= 8.

const LOW_VAL = (rank: number): number => (rank === 1 ? 1 : rank);

export interface Low { ok: boolean; ranks: number[] /* desc */ }

/** Best A-5 8-or-better low from any 5-card subset of `cards`. */
export function bestLow8(cards: Card[]): Low {
  if (cards.length < 5) return { ok: false, ranks: [] };
  let best: Low | null = null;
  for (const c5 of combos(cards, 5)) {
    const vals = c5.map((c) => LOW_VAL(c.rank));
    const set = new Set(vals);
    if (set.size !== 5) continue; // pair → invalid for low
    if (vals.some((v) => v > 8)) continue; // 8-or-better
    const sorted = [...vals].sort((a, b) => b - a); // high→low; lower is better
    const cand: Low = { ok: true, ranks: sorted };
    if (!best) best = cand;
    else {
      // lower kickers are better
      let pick = false;
      for (let i = 0; i < 5; i++) {
        if (cand.ranks[i]! < best.ranks[i]!) { pick = true; break; }
        if (cand.ranks[i]! > best.ranks[i]!) break;
      }
      if (pick) best = cand;
    }
  }
  return best ?? { ok: false, ranks: [] };
}

/** Compare lows: lower is better. Returns positive if a is better than b. */
export function compareLow(a: Low, b: Low): number {
  if (!a.ok && !b.ok) return 0;
  if (!a.ok) return -1;
  if (!b.ok) return 1;
  for (let i = 0; i < 5; i++) {
    const d = (b.ranks[i] ?? 0) - (a.ranks[i] ?? 0); // lower better → invert
    if (d !== 0) return d;
  }
  return 0;
}

/** Razz: best 5-card lowball from 7 (no 8 cap, straights/flushes don't matter; pairs hurt). */
export function bestRazz(cards: Card[]): Low {
  if (cards.length < 5) return { ok: false, ranks: [] };
  let best: Low | null = null;
  for (const c5 of combos(cards, 5)) {
    const vals = c5.map((c) => LOW_VAL(c.rank));
    // For razz, with pairs included, choose best by strict lexicographic on sorted-desc rank list,
    // but pairs make a worse hand; we encode that by using the multiset sorted desc.
    const sorted = [...vals].sort((a, b) => b - a);
    const cand: Low = { ok: true, ranks: sorted };
    if (!best) best = cand;
    else {
      let pick = false;
      for (let i = 0; i < 5; i++) {
        if (cand.ranks[i]! < best.ranks[i]!) { pick = true; break; }
        if (cand.ranks[i]! > best.ranks[i]!) break;
      }
      if (pick) best = cand;
    }
  }
  return best!;
}

// ─── Short-Deck (6+) hand ranking: flush beats full house, straight A-6-7-8-9 valid. ───
export const SDH_CLASS_ORDER: HandClass[] = [
  "high-card",
  "one-pair",
  "two-pair",
  "three-of-a-kind",
  "straight",
  "full-house",
  "flush",
  "four-of-a-kind",
  "straight-flush",
];

function shortDeckStraight(rs: number[] /* sorted desc, dedup */): { ok: boolean; high: number } {
  if (rs.length !== 5) return { ok: false, high: 0 };
  // A-9-8-7-6 wheel: ranks would be 14,9,8,7,6 → treat A as 5 for high
  if (rs[0] === 14 && rs[1] === 9 && rs[2] === 8 && rs[3] === 7 && rs[4] === 6) {
    return { ok: true, high: 9 };
  }
  if (rs[0]! - rs[4]! === 4) return { ok: true, high: rs[0]! };
  return { ok: false, high: 0 };
}

export function rankHandShortDeck(cards: Card[]): RankedHand {
  if (cards.length !== 5) throw new Error("rankHandShortDeck expects 5");
  const HIGH = (r: number): number => (r === 1 ? 14 : r);
  const ranks = cards.map((c) => HIGH(c.rank)).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const cv = groups.map((g) => g[1]);
  const uniq = [...new Set(ranks)];
  const sd = uniq.length === 5 ? shortDeckStraight(uniq) : { ok: false, high: 0 };
  if (sd.ok && isFlush) return { class: "straight-flush", kickers: [sd.high] };
  if (cv[0] === 4) return { class: "four-of-a-kind", kickers: [groups[0]![0], groups[1]![0]] };
  if (isFlush) return { class: "flush", kickers: ranks };
  if (cv[0] === 3 && cv[1] === 2) return { class: "full-house", kickers: [groups[0]![0], groups[1]![0]] };
  if (sd.ok) return { class: "straight", kickers: [sd.high] };
  if (cv[0] === 3) return { class: "three-of-a-kind", kickers: [groups[0]![0], ...groups.slice(1).map((g) => g[0])] };
  if (cv[0] === 2 && cv[1] === 2) {
    const high = Math.max(groups[0]![0], groups[1]![0]);
    const low = Math.min(groups[0]![0], groups[1]![0]);
    return { class: "two-pair", kickers: [high, low, groups[2]![0]] };
  }
  if (cv[0] === 2) return { class: "one-pair", kickers: [groups[0]![0], ...groups.slice(1).map((g) => g[0])] };
  return { class: "high-card", kickers: ranks };
}

export function compareHandsSD(a: RankedHand, b: RankedHand): number {
  const r = SDH_CLASS_ORDER.indexOf(a.class) - SDH_CLASS_ORDER.indexOf(b.class);
  if (r !== 0) return r;
  for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
    const d = (a.kickers[i] ?? 0) - (b.kickers[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function bestFiveSD(cards: Card[]): RankedHand {
  if (cards.length < 5) return { class: "high-card", kickers: [0] };
  let best: RankedHand | null = null;
  for (const c5 of combos(cards, 5)) {
    const r = rankHandShortDeck(c5);
    if (!best || compareHandsSD(r, best) > 0) best = r;
  }
  return best!;
}

// ─── Badugi rank: 4 cards, all-different ranks AND suits = "4-card badugi". ───
export interface BadugiHand { size: number; ranks: number[] /* desc */ }

export function bestBadugi(cards: Card[]): BadugiHand {
  // Try all subset sizes 4,3,2,1 — pick the largest with no rank/suit dups, then lowest ranks.
  for (let size = Math.min(4, cards.length); size >= 1; size--) {
    let best: BadugiHand | null = null;
    for (const subset of combos(cards, size)) {
      const ranks = subset.map((c) => LOW_VAL(c.rank));
      const suits = subset.map((c) => c.suit);
      if (new Set(ranks).size !== size) continue;
      if (new Set(suits).size !== size) continue;
      const sorted = [...ranks].sort((a, b) => b - a);
      const cand: BadugiHand = { size, ranks: sorted };
      if (!best) best = cand;
      else {
        let pick = false;
        for (let i = 0; i < size; i++) {
          if (cand.ranks[i]! < best.ranks[i]!) { pick = true; break; }
          if (cand.ranks[i]! > best.ranks[i]!) break;
        }
        if (pick) best = cand;
      }
    }
    if (best) return best;
  }
  return { size: 0, ranks: [] };
}

export function compareBadugi(a: BadugiHand, b: BadugiHand): number {
  if (a.size !== b.size) return a.size - b.size; // bigger badugi wins
  for (let i = 0; i < a.size; i++) {
    const d = (b.ranks[i] ?? 0) - (a.ranks[i] ?? 0); // lower is better
    if (d !== 0) return d;
  }
  return 0;
}

// ─── Hand strength heuristic for CPU (0..1) ───
const STRENGTH_TABLE: Record<HandClass, number> = {
  "high-card": 0.05,
  "one-pair": 0.25,
  "two-pair": 0.45,
  "three-of-a-kind": 0.6,
  "straight": 0.72,
  "flush": 0.8,
  "full-house": 0.88,
  "four-of-a-kind": 0.95,
  "straight-flush": 1,
};

export function handStrength(h: RankedHand): number {
  return STRENGTH_TABLE[h.class] ?? 0;
}

/** Simple CPU action chooser based on threshold. */
export function cpuChoice(strength: number, toCall: number, stack: number, pot: number): "fold" | "call" | "raise" {
  if (toCall === 0) {
    if (strength > 0.55 && stack > pot * 0.5) return "raise";
    return "call"; // check
  }
  // Pot odds: how much equity needed
  const need = toCall / (toCall + pot);
  if (strength < need - 0.05) return "fold";
  if (strength > 0.7 && stack >= toCall * 2) return "raise";
  return "call";
}
