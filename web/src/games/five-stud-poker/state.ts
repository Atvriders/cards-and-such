import type { Card } from "../../engines/deck/index.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";
import type { StudState, StudAction, StudConfig, StudSeat } from "../_shared/stud-game.js";
import { studInitialState, studReducer, studIsTerminal } from "../_shared/stud-game.js";
import { handStrength } from "../_shared/poker.js";

export interface FiveStudPokerSettings {
  startingBankroll: "500" | "1000" | "5000";
  ante: "5" | "10" | "25";
}

export type FiveStudPokerState = StudState<FiveStudPokerSettings>;
export type FiveStudPokerAction = StudAction;

export const TOTAL_HANDS = 8;

const CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

function compareRanked(a: ReturnType<typeof rankHand>, b: ReturnType<typeof rankHand>): number {
  const r = CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class);
  if (r !== 0) return r;
  for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
    const d = (a.kickers[i] ?? 0) - (b.kickers[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function bestFiveStud(cards: Card[]): { class: HandClass; kickers: number[] } {
  if (cards.length < 5) {
    const padded = [...cards];
    while (padded.length < 5) padded.push({ ...cards[0]!, id: `pad${padded.length}` });
    return rankHand(padded);
  }
  return rankHand(cards.slice(0, 5));
}

// Real 5-Card Stud: 4 streets — first deals 2 cards (1 down, 1 up), then 1 up each street.
const cfg: StudConfig<FiveStudPokerSettings> = {
  totalHands: TOTAL_HANDS,
  startingStack: (s) => parseInt(s.startingBankroll, 10),
  ante: (s) => parseInt(s.ante, 10),
  smallBet: (s) => parseInt(s.ante, 10) * 2,
  schedule: [
    { perPlayer: 2, faces: [false, true] }, // street 1: 1 down + 1 up
    { perPlayer: 1, faces: [true] },
    { perPlayer: 1, faces: [true] },
    { perPlayer: 1, faces: [true] },
  ],
  judge: (player, cpu) => {
    const ph = bestFiveStud(player.cards);
    const ch = bestFiveStud(cpu.cards);
    const cmp = compareRanked(ph, ch);
    if (cmp > 0) return { winner: "player", tag: ph.class };
    if (cmp < 0) return { winner: "cpu", tag: ch.class };
    return { winner: "split", tag: ph.class };
  },
  cpuStrength: (cpu) => {
    if (cpu.cards.length < 2) return 0.3;
    if (cpu.cards.length === 5) return handStrength(bestFiveStud(cpu.cards));
    const upCards = cpu.cards.filter((_, i) => cpu.up[i]);
    const ranks = upCards.map((c) => (c.rank === 1 ? 14 : c.rank));
    let s = 0.25;
    const counts = new Map<number, number>();
    for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
    for (const c of counts.values()) {
      if (c >= 4) s = 0.95;
      else if (c >= 3) s = 0.7;
      else if (c >= 2) s = 0.45;
    }
    if (ranks.length > 0) s += (Math.max(...ranks) - 2) / 50;
    return Math.min(0.9, s);
  },
};

export function initialState(seed: number, settings: FiveStudPokerSettings): FiveStudPokerState {
  return studInitialState(seed, settings, cfg);
}
export function reducer(state: FiveStudPokerState, action: FiveStudPokerAction): FiveStudPokerState {
  return studReducer(state, action, cfg);
}
export function isTerminal(state: FiveStudPokerState): { score: number } | null {
  return studIsTerminal(state);
}
export type { StudSeat };
