import type { Card } from "../../engines/deck/index.js";
import { newDeck } from "../../engines/deck/index.js";
import type { PGState, PGAction, PGConfig } from "../_shared/poker-game.js";
import { pgInitialState, pgReducer, pgIsTerminal } from "../_shared/poker-game.js";
import { bestFiveSD, compareHandsSD, handStrength } from "../_shared/poker.js";

export interface ShortDeckHoldemSettings {
  startingBankroll: "500" | "1000" | "5000";
  smallBlind: "5" | "10" | "25";
}

export type ShortDeckHoldemState = PGState<ShortDeckHoldemSettings>;
export type ShortDeckHoldemAction = PGAction;

export const TOTAL_HANDS = 8;

/** Short deck = 36 cards: ranks 6,7,8,9,10,J,Q,K,A only. */
function shortDeck(): Card[] {
  const full = newDeck(1);
  return full.filter((c) => c.rank === 1 || c.rank >= 6);
}

const cfg: PGConfig<ShortDeckHoldemSettings> = {
  totalHands: TOTAL_HANDS,
  startingStack: (s) => parseInt(s.startingBankroll, 10),
  smallBlind: (s) => parseInt(s.smallBlind, 10),
  holeCount: 2,
  buildDeck: shortDeck,
  judge: (player, cpu, community) => {
    const ph = bestFiveSD([...player.hole, ...community]);
    const ch = bestFiveSD([...cpu.hole, ...community]);
    const cmp = compareHandsSD(ph, ch);
    if (cmp > 0) return { winner: "player", tag: ph.class };
    if (cmp < 0) return { winner: "cpu", tag: ch.class };
    return { winner: "split", tag: ph.class };
  },
  cpuStrength: (cpu, community) => {
    if (community.length === 0) return preflopStrength(cpu.hole);
    return handStrength(bestFiveSD([...cpu.hole, ...community]));
  },
};

function preflopStrength(hole: Card[]): number {
  const ranks = hole.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
  let s = 0.25 + (ranks[0]! - 6) / 22;
  if (ranks[0] === ranks[1]) s += 0.18;
  if (hole[0]!.suit === hole[1]!.suit) s += 0.05;
  return Math.min(0.95, s);
}

export function initialState(seed: number, settings: ShortDeckHoldemSettings): ShortDeckHoldemState {
  return pgInitialState(seed, settings, cfg);
}
export function reducer(state: ShortDeckHoldemState, action: ShortDeckHoldemAction): ShortDeckHoldemState {
  return pgReducer(state, action, cfg);
}
export function isTerminal(state: ShortDeckHoldemState): { score: number } | null {
  return pgIsTerminal(state);
}
export { bestFiveSD, shortDeck };
