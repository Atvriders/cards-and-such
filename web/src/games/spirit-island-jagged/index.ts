import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandJaggedState, SpiritIslandJaggedAction, SpiritIslandJaggedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiritIslandJaggedGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const spirit_island_jagged_plugin: GamePlugin<SpiritIslandJaggedState, SpiritIslandJaggedAction, typeof settings> = {
  id: "spirit-island-jagged",
  title: "Spirit Island: Jagged Earth",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Volcanic and rocky spirits overwhelm with terrain.",
  howToPlay: "Spirit Island: Jagged Earth is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandJaggedSettings),
  reducer,
  isTerminal,
  component: SpiritIslandJaggedGame,
};

export default spirit_island_jagged_plugin;
