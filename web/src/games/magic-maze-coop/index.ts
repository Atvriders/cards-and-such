import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazeCoopState, MagicMazeCoopAction, MagicMazeCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MagicMazeCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const magic_maze_coop_plugin: GamePlugin<MagicMazeCoopState, MagicMazeCoopAction, typeof settings> = {
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
  component: MagicMazeCoopGame,
};

export default magic_maze_coop_plugin;
