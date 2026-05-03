import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { EuropeanBjCasState, EuropeanBjCasAction, EuropeanBjCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EuropeanBjCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EuropeanBjCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const europeanBjCasPlugin: GamePlugin<EuropeanBjCasState, EuropeanBjCasAction, typeof settings> = {
  id: "european-bj-cas", title: "European Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "European Blackjack — no hole card.",
  howToPlay: "European Blackjack — no hole card. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as EuropeanBjCasSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-european-bj-cas-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.yourTotal;
    if (total < 12) return { selector: '[data-testid="hint-target-european-bj-cas-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-european-bj-cas-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-european-bj-cas-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: EuropeanBjCasGame,
};
