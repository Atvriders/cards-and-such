import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LegendaryMarvelState, LegendaryMarvelAction, LegendaryMarvelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LegendaryMarvelGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const legendaryMarvelPlugin: GamePlugin<LegendaryMarvelState, LegendaryMarvelAction, typeof settings> = {
  id: "legendary-marvel",
  title: "Legendary: Marvel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marvel deck-builder coop.",
  howToPlay: "Legendary: Marvel is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LegendaryMarvelSettings),
  reducer,
  isTerminal,
  component: LegendaryMarvelGame,
};

export default legendaryMarvelPlugin;
