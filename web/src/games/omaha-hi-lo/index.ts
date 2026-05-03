import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaHiLoState, OmahaHiLoAction, OmahaHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { bestOmaha, handStrength } from "../_shared/poker.js";
const OmahaHiLoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OmahaHiLoGame as unknown as React.ComponentType<unknown> })));
const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const omahaHiLoPlugin: GamePlugin<OmahaHiLoState, OmahaHiLoAction, typeof settings> = {
  id: "omaha-hi-lo",
  title: "Omaha Hi-Lo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Omaha 8-or-Better: split pot between best high and best 8-or-better low.",
  howToPlay:
    "Omaha Hi-Lo (also called Omaha 8-or-Better) is a split-pot variant. Half the pot goes to the best high hand and half to the best A-5 lowball hand 8-or-better. Players use EXACTLY 2 of their 4 hole cards and EXACTLY 3 community cards — the same 2+3 rule applies for both halves and you can use different cards for each.\n\nIf no qualifying low exists, the high hand wins the entire pot.\n\nUse Fold/Check/Call/Raise; the bet slider sizes raises in small-blind increments.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OmahaHiLoSettings),
  reducer,
  isTerminal,
  hint: (state: OmahaHiLoState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "showdown" || (state.phase === "preflop" && state.player.hole.length === 0)) {
      return { selector: '[data-testid="hint-target-omaha-hilo-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player" || state.pendingDiscard) return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.2;
    if (state.community.length >= 3 && state.player.hole.length === 4) {
      strength = handStrength(bestOmaha(state.player.hole, state.community));
    } else if (state.player.hole.length === 4) {
      const ranks = state.player.hole.map((c) => (c.rank === 1 ? 14 : c.rank));
      const counts = new Map<number, number>();
      for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
      const hasPair = [...counts.values()].some((v) => v >= 2);
      const lows = state.player.hole.filter((c) => c.rank <= 4 || c.rank === 1).length;
      strength = 0.2 + (Math.max(...ranks) - 2) / 30 + (hasPair ? 0.1 : 0) + lows * 0.04;
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-omaha-hilo-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-omaha-hilo-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-omaha-hilo-fold"]', pulses: 3 };
  },
  component: OmahaHiLoGame,
};
