import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApothecariaSeasonsState, ApothecariaSeasonsAction, ApothecariaSeasonsSettings } from "./state.js";
import { ApothecariaSeasons_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ApothecariaSeasonsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ApothecariaSeasonsGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const apothecariaSeasonsPlugin: GamePlugin<ApothecariaSeasonsState, ApothecariaSeasonsAction, typeof settings> = {
  id: "apothecaria-seasons",
  title: "Apothecaria: Seasons",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Seasonal scenarios for Apothecaria.",
  howToPlay: "Apothecaria: Seasons is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApothecariaSeasonsSettings),
  reducer,
  isTerminal,
  hint: (state: ApothecariaSeasonsState): HintTarget | null => {
    const sel = coopHintSelector(state, ApothecariaSeasons_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ApothecariaSeasonsGame,
};

export default apothecariaSeasonsPlugin;
