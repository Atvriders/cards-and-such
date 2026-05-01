import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandNatureState, SpiritIslandNatureAction, SpiritIslandNatureSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiritIslandNatureGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const spirit_island_nature_plugin: GamePlugin<SpiritIslandNatureState, SpiritIslandNatureAction, typeof settings> = {
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
  component: SpiritIslandNatureGame,
};

export default spirit_island_nature_plugin;
