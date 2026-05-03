import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenJungleCoopState, ForbiddenJungleCoopAction, ForbiddenJungleCoopSettings } from "./state.js";
import { ForbiddenJungleCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ForbiddenJungleCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ForbiddenJungleCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbiddenJungleCoopPlugin: GamePlugin<ForbiddenJungleCoopState, ForbiddenJungleCoopAction, typeof settings> = {
  id: "forbidden-jungle-coop",
  title: "Forbidden Jungle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Escape an overgrown jungle before vines consume all.",
  howToPlay: "Forbidden Jungle is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenJungleCoopSettings),
  reducer,
  isTerminal,
  hint: (state: ForbiddenJungleCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, ForbiddenJungleCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ForbiddenJungleCoopGame,
};

export default forbiddenJungleCoopPlugin;
