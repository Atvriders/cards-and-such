import type { Card } from "../../engines/deck/index.js";
import { newDeck } from "../../engines/deck/index.js";
import type { PGState, PGAction, PGConfig } from "../_shared/poker-game.js";
import { pgInitialState, pgReducer, pgIsTerminal } from "../_shared/poker-game.js";
import { bestOmaha, compareHands, compareLow, handStrength } from "../_shared/poker.js";

export interface OmahaHiLoSettings {
  startingBankroll: "500" | "1000" | "5000";
  smallBlind: "5" | "10" | "25";
}

export type OmahaHiLoState = PGState<OmahaHiLoSettings>;
export type OmahaHiLoAction = PGAction;

export const TOTAL_HANDS = 8;

function preflopOmahaStrength(hole: Card[]): number {
  const ranks = hole.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
  let s = 0.2 + (ranks[0]! - 2) / 30;
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  for (const c of counts.values()) if (c >= 2) s += 0.1;
  const lows = hole.filter((c) => c.rank === 1 || c.rank === 2 || c.rank === 3 || c.rank === 4).length;
  s += lows * 0.04;
  return Math.min(0.95, s);
}

/** Omaha Hi-Lo: best A-5 8-or-better low using EXACTLY 2 hole + 3 community. */
export function bestOmahaLow(hole: Card[], community: Card[]): { ok: boolean; ranks: number[] } {
  if (community.length < 3 || hole.length < 2) return { ok: false, ranks: [] };
  let best: { ok: boolean; ranks: number[] } | null = null;
  for (let i = 0; i < hole.length - 1; i++) {
    for (let j = i + 1; j < hole.length; j++) {
      for (let a = 0; a < community.length - 2; a++) {
        for (let b = a + 1; b < community.length - 1; b++) {
          for (let c = b + 1; c < community.length; c++) {
            const five = [hole[i]!, hole[j]!, community[a]!, community[b]!, community[c]!];
            const vals = five.map((x) => (x.rank === 1 ? 1 : x.rank));
            if (new Set(vals).size !== 5) continue;
            if (vals.some((v) => v > 8)) continue;
            const sorted = [...vals].sort((x, y) => y - x);
            if (!best) best = { ok: true, ranks: sorted };
            else {
              for (let k = 0; k < 5; k++) {
                if (sorted[k]! < best.ranks[k]!) { best = { ok: true, ranks: sorted }; break; }
                if (sorted[k]! > best.ranks[k]!) break;
              }
            }
          }
        }
      }
    }
  }
  return best ?? { ok: false, ranks: [] };
}

const cfg: PGConfig<OmahaHiLoSettings> = {
  totalHands: TOTAL_HANDS,
  startingStack: (s) => parseInt(s.startingBankroll, 10),
  smallBlind: (s) => parseInt(s.smallBlind, 10),
  holeCount: 4,
  buildDeck: () => newDeck(1),
  judge: (player, cpu, community) => {
    if (community.length < 5) return { winner: "split", tag: "incomplete" };
    const ph = bestOmaha(player.hole, community);
    const ch = bestOmaha(cpu.hole, community);
    const plOm = bestOmahaLow(player.hole, community);
    const clOm = bestOmahaLow(cpu.hole, community);
    const highCmp = compareHands(ph, ch);
    const lowCmp = compareLow(plOm, clOm);
    if (!plOm.ok && !clOm.ok) {
      // No qualifying low — high takes whole pot
      if (highCmp > 0) return { winner: "player", tag: `${ph.class} (no low)` };
      if (highCmp < 0) return { winner: "cpu", tag: `${ch.class} (no low)` };
      return { winner: "split", tag: `tied ${ph.class}` };
    }
    // Both halves
    if (highCmp > 0 && lowCmp >= 0) return { winner: "player", tag: `scoop ${ph.class}` };
    if (highCmp < 0 && lowCmp <= 0) return { winner: "cpu", tag: `scoop ${ch.class}` };
    return { winner: "split", tag: `hi/lo split` };
  },
  cpuStrength: (cpu, community) => {
    if (community.length === 0) return preflopOmahaStrength(cpu.hole);
    return handStrength(bestOmaha(cpu.hole, community));
  },
};

export function initialState(seed: number, settings: OmahaHiLoSettings): OmahaHiLoState {
  return pgInitialState(seed, settings, cfg);
}
export function reducer(state: OmahaHiLoState, action: OmahaHiLoAction): OmahaHiLoState {
  return pgReducer(state, action, cfg);
}
export function isTerminal(state: OmahaHiLoState): { score: number } | null {
  return pgIsTerminal(state);
}
export { bestOmaha };
