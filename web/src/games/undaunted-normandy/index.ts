import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { UndauntedNormandyState, UndauntedNormandyAction, UndauntedNormandySettings } from "./state.js";
import { UndauntedNormandy_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const UndauntedNormandyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UndauntedNormandyGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const undauntedNormandyPlugin: GamePlugin<UndauntedNormandyState, UndauntedNormandyAction, typeof settings> = {
  id: "undaunted-normandy",
  title: "Undaunted: Normandy",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "WWII deckbuilding tactics.",
  howToPlay: "Undaunted: Normandy is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UndauntedNormandySettings),
  reducer,
  isTerminal,
  hint: (state: UndauntedNormandyState): HintTarget | null => {
    const sel = coopHintSelector(state, UndauntedNormandy_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: UndauntedNormandyGame,
};

export default undauntedNormandyPlugin;
