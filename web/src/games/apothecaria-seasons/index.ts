import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApothecariaSeasonsState, ApothecariaSeasonsAction, ApothecariaSeasonsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApothecariaSeasonsGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const apothecaria_seasons_plugin: GamePlugin<ApothecariaSeasonsState, ApothecariaSeasonsAction, typeof settings> = {
  id: "apothecaria-seasons",
  title: "Apothecaria: Seasons",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Seasonal scenarios for Apothecaria.",
  howToPlay: "Apothecaria: Seasons is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApothecariaSeasonsSettings),
  reducer,
  isTerminal,
  component: ApothecariaSeasonsGame,
};

export default apothecaria_seasons_plugin;
