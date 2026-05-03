import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TantoCuoreMaidsState, TantoCuoreMaidsAction, TantoCuoreMaidsSettings } from "./state.js";
import { TantoCuoreMaids_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const TantoCuoreMaidsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TantoCuoreMaidsGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const tantoCuoreMaidsPlugin: GamePlugin<TantoCuoreMaidsState, TantoCuoreMaidsAction, typeof settings> = {
  id: "tanto-cuore-maids",
  title: "Tanto Cuore: Maids",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Maid-themed deck-builder.",
  howToPlay: "Tanto Cuore: Maids is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TantoCuoreMaidsSettings),
  reducer,
  isTerminal,
  hint: (state: TantoCuoreMaidsState): HintTarget | null => {
    const sel = coopHintSelector(state, TantoCuoreMaids_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: TantoCuoreMaidsGame,
};

export default tantoCuoreMaidsPlugin;
