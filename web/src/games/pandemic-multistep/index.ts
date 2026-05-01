import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicMultistepState, PandemicMultistepAction, PandemicMultistepSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicMultistepGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemic_multistep_plugin: GamePlugin<PandemicMultistepState, PandemicMultistepAction, typeof settings> = {
  id: "pandemic-multistep",
  title: "Pandemic Multi-Step",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pandemic variant with chained turn actions.",
  howToPlay: "Pandemic Multi-Step is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicMultistepSettings),
  reducer,
  isTerminal,
  component: PandemicMultistepGame,
};

export default pandemic_multistep_plugin;
