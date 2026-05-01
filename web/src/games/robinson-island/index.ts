import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RobinsonIslandState, RobinsonIslandAction, RobinsonIslandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RobinsonIslandGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const robinson_island_plugin: GamePlugin<RobinsonIslandState, RobinsonIslandAction, typeof settings> = {
  id: "robinson-island",
  title: "Robinson: Island",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Robinson Crusoe scenario pack.",
  howToPlay: "Robinson: Island is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RobinsonIslandSettings),
  reducer,
  isTerminal,
  component: RobinsonIslandGame,
};

export default robinson_island_plugin;
