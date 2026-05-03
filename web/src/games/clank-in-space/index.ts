import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClankInSpaceState, ClankInSpaceAction, ClankInSpaceSettings } from "./state.js";
import { ClankInSpace_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ClankInSpaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ClankInSpaceGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const clankInSpacePlugin: GamePlugin<ClankInSpaceState, ClankInSpaceAction, typeof settings> = {
  id: "clank-in-space",
  title: "Clank! In! Space!",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deckbuilding heist on a space station.",
  howToPlay: "Clank! In! Space! is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClankInSpaceSettings),
  reducer,
  isTerminal,
  hint: (state: ClankInSpaceState): HintTarget | null => {
    const sel = coopHintSelector(state, ClankInSpace_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ClankInSpaceGame,
};

export default clankInSpacePlugin;
