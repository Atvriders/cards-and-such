import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazePawnState, MagicMazePawnAction, MagicMazePawnSettings } from "./state.js";
import { MagicMazePawn_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const MagicMazePawnGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagicMazePawnGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const magicMazePawnPlugin: GamePlugin<MagicMazePawnState, MagicMazePawnAction, typeof settings> = {
  id: "magic-maze-pawn",
  title: "Magic Maze: Pawn Mode",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Variant with movement restrictions.",
  howToPlay: "Magic Maze: Pawn Mode is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicMazePawnSettings),
  reducer,
  isTerminal,
  hint: (state: MagicMazePawnState): HintTarget | null => {
    const sel = coopHintSelector(state, MagicMazePawn_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MagicMazePawnGame,
};

export default magicMazePawnPlugin;
