import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewQuestPlanet9State, CrewQuestPlanet9Action, CrewQuestPlanet9Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrewQuestPlanet9Game } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const crew_quest_planet_9_plugin: GamePlugin<CrewQuestPlanet9State, CrewQuestPlanet9Action, typeof settings> = {
  id: "crew-quest-planet-9",
  title: "The Crew: Planet Nine",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trick-taking quest to find Planet 9.",
  howToPlay: "The Crew: Planet Nine is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewQuestPlanet9Settings),
  reducer,
  isTerminal,
  component: CrewQuestPlanet9Game,
};

export default crew_quest_planet_9_plugin;
