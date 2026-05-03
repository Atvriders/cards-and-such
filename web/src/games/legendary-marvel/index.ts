import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LegendaryMarvelState, LegendaryMarvelAction, LegendaryMarvelSettings } from "./state.js";
import { LegendaryMarvel_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const LegendaryMarvelGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LegendaryMarvelGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const legendaryMarvelPlugin: GamePlugin<LegendaryMarvelState, LegendaryMarvelAction, typeof settings> = {
  id: "legendary-marvel",
  title: "Legendary: Marvel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marvel deck-builder coop.",
  howToPlay: "Legendary: Marvel is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LegendaryMarvelSettings),
  reducer,
  isTerminal,
  hint: (state: LegendaryMarvelState): HintTarget | null => {
    const sel = coopHintSelector(state, LegendaryMarvel_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: LegendaryMarvelGame,
};

export default legendaryMarvelPlugin;
