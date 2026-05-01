import type { Card } from "../../engines/deck/index.js";
import type { StudState, StudAction, StudConfig } from "../_shared/stud-game.js";
import { studInitialState, studReducer, studIsTerminal } from "../_shared/stud-game.js";
import { bestFive, bestLow8, compareHands, compareLow, handStrength } from "../_shared/poker.js";

export interface SevenStudHiLoSettings {
  startingBankroll: "500" | "1000" | "5000";
  ante: "5" | "10" | "25";
}

export type SevenStudHiLoState = StudState<SevenStudHiLoSettings>;
export type SevenStudHiLoAction = StudAction;

export const TOTAL_HANDS = 8;

// 7-card stud: 5 streets — 3 (2 down, 1 up), 1 up, 1 up, 1 up, 1 down (river).
const cfg: StudConfig<SevenStudHiLoSettings> = {
  totalHands: TOTAL_HANDS,
  startingStack: (s) => parseInt(s.startingBankroll, 10),
  ante: (s) => parseInt(s.ante, 10),
  smallBet: (s) => parseInt(s.ante, 10) * 2,
  schedule: [
    { perPlayer: 3, faces: [false, false, true] }, // 3rd street: 2 down + 1 up (door card)
    { perPlayer: 1, faces: [true] },               // 4th street
    { perPlayer: 1, faces: [true] },               // 5th street
    { perPlayer: 1, faces: [true] },               // 6th street
    { perPlayer: 1, faces: [false] },              // 7th street: river (down)
  ],
  judge: (player, cpu) => {
    const ph = bestFive(player.cards);
    const ch = bestFive(cpu.cards);
    const pl = bestLow8(player.cards);
    const cl = bestLow8(cpu.cards);
    const highCmp = compareHands(ph, ch);
    const lowCmp = compareLow(pl, cl);
    if (!pl.ok && !cl.ok) {
      if (highCmp > 0) return { winner: "player", tag: `${ph.class} (no low)` };
      if (highCmp < 0) return { winner: "cpu", tag: `${ch.class} (no low)` };
      return { winner: "split", tag: "tied" };
    }
    if (highCmp > 0 && lowCmp >= 0) return { winner: "player", tag: `scoop ${ph.class}` };
    if (highCmp < 0 && lowCmp <= 0) return { winner: "cpu", tag: `scoop ${ch.class}` };
    return { winner: "split", tag: "hi/lo split" };
  },
  cpuStrength: (cpu) => {
    if (cpu.cards.length < 3) return 0.3;
    const high = handStrength(bestFive(cpu.cards));
    const low = bestLow8(cpu.cards).ok ? 0.5 : 0;
    return Math.min(0.95, Math.max(high, (high + low) / 1.5));
  },
};

export function initialState(seed: number, settings: SevenStudHiLoSettings): SevenStudHiLoState {
  return studInitialState(seed, settings, cfg);
}
export function reducer(state: SevenStudHiLoState, action: SevenStudHiLoAction): SevenStudHiLoState {
  return studReducer(state, action, cfg);
}
export function isTerminal(state: SevenStudHiLoState): { score: number } | null {
  return studIsTerminal(state);
}
export { bestFive, bestLow8 };
export function bestSevenHigh(cards: Card[]): ReturnType<typeof bestFive> { return bestFive(cards); }
