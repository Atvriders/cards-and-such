import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MiniBaccaratCasState, MiniBaccaratCasAction, MiniBaccaratCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniBaccaratCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniBaccaratCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: MiniBaccaratCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "bet") return { selector: '[data-testid="hint-target-mini-baccarat-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-mini-baccarat-cas-secondary"]', pulses: 3 };
  return null;
};
export const miniBaccaratCasPlugin: GamePlugin<MiniBaccaratCasState, MiniBaccaratCasAction, typeof settings> = {
  id: "mini-baccarat-cas", title: "Mini Baccarat", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Baccarat — bet on Player or Banker, the higher total wins.",
  howToPlay: "Mini Baccarat — bet on Player or Banker, the higher total wins. Bet on Player, Banker, or Tie. Cards drawn following baccarat rules. Higher of two totals (mod 10) wins. Player pays 20, Banker pays 19, Tie pays 80.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as MiniBaccaratCasSettings),
  reducer, isTerminal, hint: hint, component: MiniBaccaratCasGame,
};
