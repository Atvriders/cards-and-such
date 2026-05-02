import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrizzledCoopState, GrizzledCoopAction, GrizzledCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrizzledCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const grizzledCoopPlugin: GamePlugin<GrizzledCoopState, GrizzledCoopAction, typeof settings> = {
  id: "grizzled-coop",
  title: "The Grizzled",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "WWI soldiers survive the trenches.",
  howToPlay: "The Grizzled is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrizzledCoopSettings),
  reducer,
  isTerminal,
  component: GrizzledCoopGame,
};

export default grizzledCoopPlugin;
