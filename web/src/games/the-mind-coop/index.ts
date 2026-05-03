import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TheMindCoopState, TheMindCoopAction, TheMindCoopSettings } from "./state.js";
import { TheMindCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const TheMindCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TheMindCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const theMindCoopPlugin: GamePlugin<TheMindCoopState, TheMindCoopAction, typeof settings> = {
  id: "the-mind-coop",
  title: "The Mind",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wordless number-sequencing telepathy.",
  howToPlay: "The Mind is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TheMindCoopSettings),
  reducer,
  isTerminal,
  hint: (state: TheMindCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, TheMindCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: TheMindCoopGame,
};

export default theMindCoopPlugin;
