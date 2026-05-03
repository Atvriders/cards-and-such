import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShortDeckHoldemState, ShortDeckHoldemAction, ShortDeckHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal, bestFiveSD } from "./state.js";
import { handStrength } from "../_shared/poker.js";
const ShortDeckHoldemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ShortDeckHoldemGame as unknown as React.ComponentType<unknown> })));
const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const shortDeckHoldemPlugin: GamePlugin<ShortDeckHoldemState, ShortDeckHoldemAction, typeof settings> = {
  id: "short-deck-holdem",
  title: "Short Deck Hold'em",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Short-Deck (6+) Hold'em: 36-card deck, flush beats full house, A-6-7-8-9 is a straight.",
  howToPlay:
    "Short-Deck Hold'em (a.k.a. 6+ Hold'em) is Texas Hold'em with all 2s, 3s, 4s, and 5s removed — leaving 36 cards. Modified rankings:\n\n- A flush BEATS a full house (flushes are rarer with fewer cards of each suit).\n- The wheel A-6-7-8-9 is the lowest straight.\n- Trips and straights swap in some house rules; this game keeps trips below straights for simplicity.\n\nUse Fold/Check/Call/Raise. Beat the CPU over 8 hands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShortDeckHoldemSettings),
  reducer,
  isTerminal,
  hint: (state: ShortDeckHoldemState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "showdown" || (state.phase === "preflop" && state.player.hole.length === 0)) {
      return { selector: '[data-testid="hint-target-sdholdem-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player" || state.pendingDiscard) return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.25;
    if (state.community.length >= 3 && state.player.hole.length === 2) {
      strength = handStrength(bestFiveSD([...state.player.hole, ...state.community]));
    } else if (state.player.hole.length === 2) {
      const [a, b] = state.player.hole;
      const ra = a!.rank === 1 ? 14 : a!.rank;
      const rb = b!.rank === 1 ? 14 : b!.rank;
      strength = 0.25 + (Math.max(ra, rb) - 6) / 22 + (ra === rb ? 0.18 : 0) + (a!.suit === b!.suit ? 0.05 : 0);
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-sdholdem-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-sdholdem-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-sdholdem-fold"]', pulses: 3 };
  },
  component: ShortDeckHoldemGame,
};
