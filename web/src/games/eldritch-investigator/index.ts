import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EldritchInvestigatorState, EldritchInvestigatorAction, EldritchInvestigatorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EldritchInvestigatorGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const eldritch_investigator_plugin: GamePlugin<EldritchInvestigatorState, EldritchInvestigatorAction, typeof settings> = {
  id: "eldritch-investigator",
  title: "Eldritch Horror: Investigator",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Globe-trotting Lovecraftian investigators.",
  howToPlay: "Eldritch Horror: Investigator is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EldritchInvestigatorSettings),
  reducer,
  isTerminal,
  component: EldritchInvestigatorGame,
};

export default eldritch_investigator_plugin;
