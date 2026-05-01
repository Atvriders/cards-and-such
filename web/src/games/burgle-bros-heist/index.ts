import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BurgleBrosHeistState, BurgleBrosHeistAction, BurgleBrosHeistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BurgleBrosHeistGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const burgle_bros_heist_plugin: GamePlugin<BurgleBrosHeistState, BurgleBrosHeistAction, typeof settings> = {
  id: "burgle-bros-heist",
  title: "Burgle Bros",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-floor heist coop.",
  howToPlay: "Burgle Bros is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BurgleBrosHeistSettings),
  reducer,
  isTerminal,
  component: BurgleBrosHeistGame,
};

export default burgle_bros_heist_plugin;
