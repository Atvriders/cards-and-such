import type { Card } from "../../engines/deck/index.js";
import { newDeck } from "../../engines/deck/index.js";
import type { PGState, PGAction, PGConfig } from "../_shared/poker-game.js";
import { pgInitialState, pgReducer, pgIsTerminal } from "../_shared/poker-game.js";
import { bestFive, compareHands, handStrength } from "../_shared/poker.js";

export interface CrazyPineappleSettings {
  startingBankroll: "500" | "1000" | "5000";
  smallBlind: "5" | "10" | "25";
}

export type CrazyPineappleState = PGState<CrazyPineappleSettings>;
export type CrazyPineappleAction = PGAction;

export const TOTAL_HANDS = 8;

const cfg: PGConfig<CrazyPineappleSettings> = {
  totalHands: TOTAL_HANDS,
  startingStack: (s) => parseInt(s.startingBankroll, 10),
  smallBlind: (s) => parseInt(s.smallBlind, 10),
  holeCount: 3,
  buildDeck: () => newDeck(1),
  judge: (player, cpu, community) => {
    const ph = bestFive([...player.hole, ...community]);
    const ch = bestFive([...cpu.hole, ...community]);
    const cmp = compareHands(ph, ch);
    if (cmp > 0) return { winner: "player", tag: ph.class };
    if (cmp < 0) return { winner: "cpu", tag: ch.class };
    return { winner: "split", tag: ph.class };
  },
  cpuStrength: (cpu, community) => {
    if (community.length === 0) return preflopStrength(cpu.hole);
    return handStrength(bestFive([...cpu.hole, ...community]));
  },
  // Crazy Pineapple: discard AFTER the flop is dealt.
  onAfterFlop: (state) => ({ ...state, pendingDiscard: true, message: "Discard 1 of your 3 hole cards (Crazy Pineapple)." }),
};

function preflopStrength(hole: Card[]): number {
  const ranks = hole.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
  let s = 0.2 + (ranks[0]! - 2) / 30;
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  for (const c of counts.values()) if (c >= 2) s += 0.18;
  return Math.min(0.95, s);
}

export function initialState(seed: number, settings: CrazyPineappleSettings): CrazyPineappleState {
  return pgInitialState(seed, settings, cfg);
}
export function reducer(state: CrazyPineappleState, action: CrazyPineappleAction): CrazyPineappleState {
  return pgReducer(state, action, cfg);
}
export function isTerminal(state: CrazyPineappleState): { score: number } | null {
  return pgIsTerminal(state);
}
export { bestFive };
