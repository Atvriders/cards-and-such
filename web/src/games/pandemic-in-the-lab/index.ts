import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicInTheLabState, PandemicInTheLabAction, PandemicInTheLabSettings } from "./state.js";
import { PandemicInTheLab_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const PandemicInTheLabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PandemicInTheLabGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicInTheLabPlugin: GamePlugin<PandemicInTheLabState, PandemicInTheLabAction, typeof settings> = {
  id: "pandemic-in-the-lab",
  title: "Pandemic: In the Lab",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lab-research expansion: synthesize cures from samples.",
  howToPlay: "Pandemic: In the Lab is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicInTheLabSettings),
  reducer,
  isTerminal,
  hint: (state: PandemicInTheLabState): HintTarget | null => {
    const sel = coopHintSelector(state, PandemicInTheLab_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: PandemicInTheLabGame,
};

export default pandemicInTheLabPlugin;
