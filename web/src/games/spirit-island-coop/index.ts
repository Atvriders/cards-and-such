import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandCoopState, SpiritIslandCoopAction, SpiritIslandCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiritIslandCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const spirit_island_coop_plugin: GamePlugin<SpiritIslandCoopState, SpiritIslandCoopAction, typeof settings> = {
  id: "spirit-island-coop",
  title: "Spirit Island",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spirits defend their island from invading colonizers.",
  howToPlay: "Spirit Island is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandCoopSettings),
  reducer,
  isTerminal,
  component: SpiritIslandCoopGame,
};

export default spirit_island_coop_plugin;
