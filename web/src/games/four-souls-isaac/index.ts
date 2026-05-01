import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourSoulsIsaacState, FourSoulsIsaacAction, FourSoulsIsaacSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourSoulsIsaacGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const four_souls_isaac_plugin: GamePlugin<FourSoulsIsaacState, FourSoulsIsaacAction, typeof settings> = {
  id: "four-souls-isaac",
  title: "Four Souls: Isaac",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roguelike co-op deck-builder.",
  howToPlay: "Four Souls: Isaac is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FourSoulsIsaacSettings),
  reducer,
  isTerminal,
  component: FourSoulsIsaacGame,
};

export default four_souls_isaac_plugin;
