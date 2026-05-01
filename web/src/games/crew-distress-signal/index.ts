import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewDistressSignalState, CrewDistressSignalAction, CrewDistressSignalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrewDistressSignalGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const crew_distress_signal_plugin: GamePlugin<CrewDistressSignalState, CrewDistressSignalAction, typeof settings> = {
  id: "crew-distress-signal",
  title: "The Crew: Distress Signal",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Distress-signal variant for The Crew.",
  howToPlay: "The Crew: Distress Signal is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewDistressSignalSettings),
  reducer,
  isTerminal,
  component: CrewDistressSignalGame,
};

export default crew_distress_signal_plugin;
