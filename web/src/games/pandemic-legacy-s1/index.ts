import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicLegacyS1State, PandemicLegacyS1Action, PandemicLegacyS1Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicLegacyS1Game } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemic_legacy_s1_plugin: GamePlugin<PandemicLegacyS1State, PandemicLegacyS1Action, typeof settings> = {
  id: "pandemic-legacy-s1",
  title: "Pandemic Legacy S1",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative campaign: faded city by city.",
  howToPlay: "Pandemic Legacy S1 is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicLegacyS1Settings),
  reducer,
  isTerminal,
  component: PandemicLegacyS1Game,
};

export default pandemic_legacy_s1_plugin;
