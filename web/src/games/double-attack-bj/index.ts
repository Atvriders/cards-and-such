import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleAttackBjState, DoubleAttackBjAction, DoubleAttackBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DoubleAttackBjGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DoubleAttackBjGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleAttackBjPlugin: GamePlugin<DoubleAttackBjState, DoubleAttackBjAction, typeof settings> = {
  id: "double-attack-bj", title: "Double Attack Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Double Attack Blackjack — Spanish deck (no 10s), BJ pays even money.",
  howToPlay: "Double Attack Blackjack — Spanish deck (no 10s), BJ pays even money. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.0:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as DoubleAttackBjSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-double-attack-bj-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.yourTotal;
    if (total < 12) return { selector: '[data-testid="hint-target-double-attack-bj-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-double-attack-bj-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-double-attack-bj-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: DoubleAttackBjGame,
};
