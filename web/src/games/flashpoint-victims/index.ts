import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlashpointVictimsState, FlashpointVictimsAction, FlashpointVictimsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlashpointVictimsGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const flashpoint_victims_plugin: GamePlugin<FlashpointVictimsState, FlashpointVictimsAction, typeof settings> = {
  id: "flashpoint-victims",
  title: "Flash Point: Victims",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Victim-rescue intensive scenario.",
  howToPlay: "Flash Point: Victims is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlashpointVictimsSettings),
  reducer,
  isTerminal,
  component: FlashpointVictimsGame,
};

export default flashpoint_victims_plugin;
