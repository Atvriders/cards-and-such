import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenStudHiLoState, SevenStudHiLoAction, SevenStudHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal, bestFive, bestLow8 } from "./state.js";
import { handStrength } from "../_shared/poker.js";
const SevenStudHiLoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SevenStudHiLoGame as unknown as React.ComponentType<unknown> })));
const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  ante: { kind: "enum" as const, label: "Ante", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const sevenStudHiLoPlugin: GamePlugin<SevenStudHiLoState, SevenStudHiLoAction, typeof settings> = {
  id: "seven-stud-hi-lo",
  title: "7-Card Stud Hi-Lo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up 7-Card Stud 8-or-Better: split pot between best high and qualifying low.",
  howToPlay:
    "7-Card Stud Hi-Lo splits the pot between best high hand and best A-5 low (8-or-better). Each player receives 7 cards over 5 streets:\n\n- 3rd street: 2 down + 1 up (door card)\n- 4th, 5th, 6th street: 1 up each\n- 7th street (river): 1 down\n\nBest 5 of your 7 for high; if a qualifying low (5 cards 8 or below, no pair) exists, half the pot goes to the best low. Different cards may be used for each half.\n\nUse Fold/Check/Call/Raise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenStudHiLoSettings),
  reducer,
  isTerminal,
  hint: (state: SevenStudHiLoState): HintTarget | null => {
    if (state.done) return null;
    if (state.street === 0) {
      return { selector: '[data-testid="hint-target-sevenstud-hilo-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player") return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.25;
    if (state.player.cards.length >= 5) {
      const high = handStrength(bestFive(state.player.cards));
      const low = bestLow8(state.player.cards).ok ? 0.5 : 0;
      strength = Math.min(0.95, Math.max(high, (high + low) / 1.5));
    } else if (state.player.cards.length >= 3) {
      const ranks = state.player.cards.map((c) => (c.rank === 1 ? 14 : c.rank));
      const counts = new Map<number, number>();
      for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
      const mx = Math.max(0, ...counts.values());
      const lows = state.player.cards.filter((c) => c.rank === 1 || c.rank <= 8).length;
      strength = mx >= 3 ? 0.6 : mx === 2 ? 0.4 : 0.2 + (lows / 7) * 0.25;
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-sevenstud-hilo-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-sevenstud-hilo-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-sevenstud-hilo-fold"]', pulses: 3 };
  },
  component: SevenStudHiLoGame,
};
