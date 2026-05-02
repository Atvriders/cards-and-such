import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlashpointRescueCoopState, FlashpointRescueCoopAction, FlashpointRescueCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlashpointRescueCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const flashpointRescueCoopPlugin: GamePlugin<FlashpointRescueCoopState, FlashpointRescueCoopAction, typeof settings> = {
  id: "flashpoint-rescue-coop",
  title: "Flash Point: Fire Rescue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Firefighters rescue victims from a burning house.",
  howToPlay: "Flash Point: Fire Rescue is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlashpointRescueCoopSettings),
  reducer,
  isTerminal,
  component: FlashpointRescueCoopGame,
};

export default flashpointRescueCoopPlugin;
