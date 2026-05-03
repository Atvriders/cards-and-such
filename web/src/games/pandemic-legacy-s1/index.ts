import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicLegacyS1State, PandemicLegacyS1Action, PandemicLegacyS1Settings } from "./state.js";
import { PandemicLegacyS1_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const PandemicLegacyS1Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PandemicLegacyS1Game as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicLegacyS1Plugin: GamePlugin<PandemicLegacyS1State, PandemicLegacyS1Action, typeof settings> = {
  id: "pandemic-legacy-s1",
  title: "Pandemic Legacy S1",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative campaign: faded city by city.",
  howToPlay: "Pandemic Legacy S1 is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicLegacyS1Settings),
  reducer,
  isTerminal,
  hint: (state: PandemicLegacyS1State): HintTarget | null => {
    const sel = coopHintSelector(state, PandemicLegacyS1_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: PandemicLegacyS1Game,
};

export default pandemicLegacyS1Plugin;
