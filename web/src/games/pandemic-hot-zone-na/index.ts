import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicHotZoneNaState, PandemicHotZoneNaAction, PandemicHotZoneNaSettings } from "./state.js";
import { PandemicHotZoneNa_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const PandemicHotZoneNaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PandemicHotZoneNaGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicHotZoneNaPlugin: GamePlugin<PandemicHotZoneNaState, PandemicHotZoneNaAction, typeof settings> = {
  id: "pandemic-hot-zone-na",
  title: "Pandemic Hot Zone N.A.",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Faster Pandemic in three North American cities.",
  howToPlay: "Pandemic Hot Zone N.A. is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicHotZoneNaSettings),
  reducer,
  isTerminal,
  hint: (state: PandemicHotZoneNaState): HintTarget | null => {
    const sel = coopHintSelector(state, PandemicHotZoneNa_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: PandemicHotZoneNaGame,
};

export default pandemicHotZoneNaPlugin;
