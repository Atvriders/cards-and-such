import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleExposureBjState, DoubleExposureBjAction, DoubleExposureBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DoubleExposureBjGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DoubleExposureBjGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleExposureBjPlugin: GamePlugin<DoubleExposureBjState, DoubleExposureBjAction, typeof settings> = {
  id: "double-exposure-bj", title: "Double Exposure Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack with both dealer cards face up. House wins all ties.",
  howToPlay: "Double Exposure Blackjack flips the script: both dealer cards are dealt face up. You see exactly what you're chasing before you decide to hit or stand. The catch is that all ties go to the dealer (instead of pushing), and natural blackjacks pay even money (instead of three-to-two).\n\nEach round you place a one-credit bet, are dealt two cards, and the dealer also reveals two cards. You then choose to hit (draw another card) or stand. After you stand, the dealer follows fixed rules: hits on sixteen or under, stands on seventeen or higher. Cards are valued normally — face cards are ten, aces are eleven (or one if needed).\n\nTwelve rounds are played. A win pays twelve points; a loss costs the bet (zero points); a push (tie) pays nothing because the house wins ties. Expected score across twelve rounds is around forty-five points; great runs push past seventy. The full information helps a lot when deciding to stand on twelve through sixteen.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DoubleExposureBjSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-double-exposure-bj-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.total;
    if (total < 12) return { selector: '[data-testid="hint-target-double-exposure-bj-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-double-exposure-bj-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-double-exposure-bj-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: DoubleExposureBjGame,
};
