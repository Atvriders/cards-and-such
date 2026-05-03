import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PontoonCasState, PontoonCasAction, PontoonCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PontoonCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PontoonCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: PontoonCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "play") return { selector: '[data-testid="hint-target-pontoon-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-pontoon-cas-secondary"]', pulses: 3 };
  return null;
};
export const pontoonCasPlugin: GamePlugin<PontoonCasState, PontoonCasAction, typeof settings> = {
  id: "pontoon-cas", title: "Pontoon", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pontoon — British BJ. Pontoon (21 on first two) pays 2:1.",
  howToPlay: "Pontoon — British BJ. Pontoon (21 on first two) pays 2:1. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 2.0:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as PontoonCasSettings),
  reducer, isTerminal, hint: hint, component: PontoonCasGame,
};
