import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SummonerWarsGridState, SummonerWarsGridAction, SummonerWarsGridSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SummonerWarsGridGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const summoner_wars_grid_plugin: GamePlugin<SummonerWarsGridState, SummonerWarsGridAction, typeof settings> = {
  id: "summoner-wars-grid",
  title: "Summoner Wars: Grid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Grid combat with summoners.",
  howToPlay: "Summoner Wars: Grid is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SummonerWarsGridSettings),
  reducer,
  isTerminal,
  component: SummonerWarsGridGame,
};

export default summoner_wars_grid_plugin;
