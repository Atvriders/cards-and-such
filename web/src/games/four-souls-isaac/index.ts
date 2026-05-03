import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourSoulsIsaacState, FourSoulsIsaacAction, FourSoulsIsaacSettings } from "./state.js";
import { FourSoulsIsaac_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const FourSoulsIsaacGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FourSoulsIsaacGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const fourSoulsIsaacPlugin: GamePlugin<FourSoulsIsaacState, FourSoulsIsaacAction, typeof settings> = {
  id: "four-souls-isaac",
  title: "Four Souls: Isaac",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roguelike co-op deck-builder.",
  howToPlay: "Four Souls: Isaac is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FourSoulsIsaacSettings),
  reducer,
  isTerminal,
  hint: (state: FourSoulsIsaacState): HintTarget | null => {
    const sel = coopHintSelector(state, FourSoulsIsaac_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: FourSoulsIsaacGame,
};

export default fourSoulsIsaacPlugin;
