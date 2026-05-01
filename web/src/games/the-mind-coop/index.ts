import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TheMindCoopState, TheMindCoopAction, TheMindCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TheMindCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const the_mind_coop_plugin: GamePlugin<TheMindCoopState, TheMindCoopAction, typeof settings> = {
  id: "the-mind-coop",
  title: "The Mind",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wordless number-sequencing telepathy.",
  howToPlay: "The Mind is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TheMindCoopSettings),
  reducer,
  isTerminal,
  component: TheMindCoopGame,
};

export default the_mind_coop_plugin;
