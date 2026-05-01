import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenIslandCoopState, ForbiddenIslandCoopAction, ForbiddenIslandCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenIslandCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbidden_island_coop_plugin: GamePlugin<ForbiddenIslandCoopState, ForbiddenIslandCoopAction, typeof settings> = {
  id: "forbidden-island-coop",
  title: "Forbidden Island",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Recover treasures before the island sinks.",
  howToPlay: "Forbidden Island is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenIslandCoopSettings),
  reducer,
  isTerminal,
  component: ForbiddenIslandCoopGame,
};

export default forbidden_island_coop_plugin;
