import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ChineseBlackjackCasState, ChineseBlackjackCasAction, ChineseBlackjackCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChineseBlackjackCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChineseBlackjackCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseBlackjackCasPlugin: GamePlugin<ChineseBlackjackCasState, ChineseBlackjackCasAction, typeof settings> = {
  id: "chinese-blackjack-cas", title: "Chinese Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese Blackjack — multi-deck variant.",
  howToPlay: "Chinese Blackjack — multi-deck variant. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as ChineseBlackjackCasSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-chinese-blackjack-cas-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.yourTotal;
    if (total < 12) return { selector: '[data-testid="hint-target-chinese-blackjack-cas-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-chinese-blackjack-cas-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-chinese-blackjack-cas-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: ChineseBlackjackCasGame,
};
