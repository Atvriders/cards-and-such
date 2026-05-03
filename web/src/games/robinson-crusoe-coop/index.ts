import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RobinsonCrusoeCoopState, RobinsonCrusoeCoopAction, RobinsonCrusoeCoopSettings } from "./state.js";
import { RobinsonCrusoeCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const RobinsonCrusoeCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RobinsonCrusoeCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const robinsonCrusoeCoopPlugin: GamePlugin<RobinsonCrusoeCoopState, RobinsonCrusoeCoopAction, typeof settings> = {
  id: "robinson-crusoe-coop",
  title: "Robinson Crusoe",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stranded survivors build, hunt and explore.",
  howToPlay: "Robinson Crusoe is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RobinsonCrusoeCoopSettings),
  reducer,
  isTerminal,
  hint: (state: RobinsonCrusoeCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, RobinsonCrusoeCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: RobinsonCrusoeCoopGame,
};

export default robinsonCrusoeCoopPlugin;
