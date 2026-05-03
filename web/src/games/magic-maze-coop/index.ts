import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazeCoopState, MagicMazeCoopAction, MagicMazeCoopSettings } from "./state.js";
import { MagicMazeCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const MagicMazeCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagicMazeCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const magicMazeCoopPlugin: GamePlugin<MagicMazeCoopState, MagicMazeCoopAction, typeof settings> = {
  id: "magic-maze-coop",
  title: "Magic Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Silent cooperative dungeon shopping spree.",
  howToPlay: "Magic Maze is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicMazeCoopSettings),
  reducer,
  isTerminal,
  hint: (state: MagicMazeCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, MagicMazeCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MagicMazeCoopGame,
};

export default magicMazeCoopPlugin;
