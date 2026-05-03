import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanabiExtraCoopState, HanabiExtraCoopAction, HanabiExtraCoopSettings } from "./state.js";
import { HanabiExtraCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const HanabiExtraCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HanabiExtraCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hanabiExtraCoopPlugin: GamePlugin<HanabiExtraCoopState, HanabiExtraCoopAction, typeof settings> = {
  id: "hanabi-extra-coop",
  title: "Hanabi: Extra",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hanabi with extra suits.",
  howToPlay: "Hanabi: Extra is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HanabiExtraCoopSettings),
  reducer,
  isTerminal,
  hint: (state: HanabiExtraCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, HanabiExtraCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: HanabiExtraCoopGame,
};

export default hanabiExtraCoopPlugin;
