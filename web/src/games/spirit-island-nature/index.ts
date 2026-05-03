import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandNatureState, SpiritIslandNatureAction, SpiritIslandNatureSettings } from "./state.js";
import { SpiritIslandNature_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const SpiritIslandNatureGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpiritIslandNatureGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const spiritIslandNaturePlugin: GamePlugin<SpiritIslandNatureState, SpiritIslandNatureAction, typeof settings> = {
  id: "spirit-island-nature",
  title: "Spirit Island: Nature Incarnate",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nature spirits bend rivers and roots to drive invaders.",
  howToPlay: "Spirit Island: Nature Incarnate is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandNatureSettings),
  reducer,
  isTerminal,
  hint: (state: SpiritIslandNatureState): HintTarget | null => {
    const sel = coopHintSelector(state, SpiritIslandNature_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SpiritIslandNatureGame,
};

export default spiritIslandNaturePlugin;
