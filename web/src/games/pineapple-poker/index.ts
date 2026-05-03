import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineapplePokerState, PineapplePokerAction, PineapplePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal, bestFive } from "./state.js";
import { handStrength } from "../_shared/poker.js";
const PineapplePokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PineapplePokerGame as unknown as React.ComponentType<unknown> })));
const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const pineapplePokerPlugin: GamePlugin<PineapplePokerState, PineapplePokerAction, typeof settings> = {
  id: "pineapple-poker",
  title: "Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Pineapple: 3 hole cards, discard 1 before the flop, then play like Hold'em.",
  howToPlay:
    "Pineapple is a Hold'em variant where each player receives THREE hole cards. Before the flop is dealt, you must discard one — leaving the standard 2 hole cards used through the rest of the hand. Click on a hole card to discard it.\n\nFrom there it plays exactly like Texas Hold'em: flop, turn, river, betting on each street, then showdown. Your final hand uses your best 5 cards from the 2 hole + 5 board (any combination).\n\nUse Fold/Check/Call/Raise. Beat the CPU over 8 hands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PineapplePokerSettings),
  reducer,
  isTerminal,
  hint: (state: PineapplePokerState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "showdown" || (state.phase === "preflop" && state.player.hole.length === 0)) {
      return { selector: '[data-testid="hint-target-pineap-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player" || state.pendingDiscard) return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.2;
    if (state.community.length >= 3 && state.player.hole.length >= 2) {
      strength = handStrength(bestFive([...state.player.hole, ...state.community]));
    } else if (state.player.hole.length >= 2) {
      const ranks = state.player.hole.map((c) => (c.rank === 1 ? 14 : c.rank));
      const counts = new Map<number, number>();
      for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
      const hasPair = [...counts.values()].some((v) => v >= 2);
      strength = 0.2 + (Math.max(...ranks) - 2) / 30 + (hasPair ? 0.15 : 0);
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-pineap-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-pineap-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-pineap-fold"]', pulses: 3 };
  },
  component: PineapplePokerGame,
};
