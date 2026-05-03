import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenDesertCoopState, ForbiddenDesertCoopAction, ForbiddenDesertCoopSettings } from "./state.js";
import { ForbiddenDesertCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ForbiddenDesertCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ForbiddenDesertCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbiddenDesertCoopPlugin: GamePlugin<ForbiddenDesertCoopState, ForbiddenDesertCoopAction, typeof settings> = {
  id: "forbidden-desert-coop",
  title: "Forbidden Desert",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Assemble a flying machine before the sand buries you.",
  howToPlay: "Forbidden Desert is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenDesertCoopSettings),
  reducer,
  isTerminal,
  hint: (state: ForbiddenDesertCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, ForbiddenDesertCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ForbiddenDesertCoopGame,
};

export default forbiddenDesertCoopPlugin;
