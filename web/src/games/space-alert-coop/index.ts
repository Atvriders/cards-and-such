import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpaceAlertCoopState, SpaceAlertCoopAction, SpaceAlertCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpaceAlertCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const space_alert_coop_plugin: GamePlugin<SpaceAlertCoopState, SpaceAlertCoopAction, typeof settings> = {
  id: "space-alert-coop",
  title: "Space Alert",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real-time spaceship coop.",
  howToPlay: "Space Alert is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpaceAlertCoopSettings),
  reducer,
  isTerminal,
  component: SpaceAlertCoopGame,
};

export default space_alert_coop_plugin;
