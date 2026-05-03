import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenSkyCoopState, ForbiddenSkyCoopAction, ForbiddenSkyCoopSettings } from "./state.js";
import { ForbiddenSkyCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ForbiddenSkyCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ForbiddenSkyCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbiddenSkyCoopPlugin: GamePlugin<ForbiddenSkyCoopState, ForbiddenSkyCoopAction, typeof settings> = {
  id: "forbidden-sky-coop",
  title: "Forbidden Sky",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a rocket on a thunderhead and escape.",
  howToPlay: "Forbidden Sky is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenSkyCoopSettings),
  reducer,
  isTerminal,
  hint: (state: ForbiddenSkyCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, ForbiddenSkyCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ForbiddenSkyCoopGame,
};

export default forbiddenSkyCoopPlugin;
