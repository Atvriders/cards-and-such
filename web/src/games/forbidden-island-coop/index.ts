import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenIslandCoopState, ForbiddenIslandCoopAction, ForbiddenIslandCoopSettings } from "./state.js";
import { ForbiddenIslandCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ForbiddenIslandCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ForbiddenIslandCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbiddenIslandCoopPlugin: GamePlugin<ForbiddenIslandCoopState, ForbiddenIslandCoopAction, typeof settings> = {
  id: "forbidden-island-coop",
  title: "Forbidden Island",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Recover treasures before the island sinks.",
  howToPlay: "Forbidden Island is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenIslandCoopSettings),
  reducer,
  isTerminal,
  hint: (state: ForbiddenIslandCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, ForbiddenIslandCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ForbiddenIslandCoopGame,
};

export default forbiddenIslandCoopPlugin;
