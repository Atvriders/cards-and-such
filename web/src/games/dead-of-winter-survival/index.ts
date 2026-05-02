import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, DeadOfWinterSurvivalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeadOfWinterSurvivalGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const deadOfWinterSurvivalPlugin: GamePlugin<DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, typeof settings> = {
  id: "dead-of-winter-survival",
  title: "Dead of Winter: Survival",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Colonists survive zombie winter, secret betrayer possible.",
  howToPlay: "Dead of Winter: Survival is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeadOfWinterSurvivalSettings),
  reducer,
  isTerminal,
  component: DeadOfWinterSurvivalGame,
};

export default deadOfWinterSurvivalPlugin;
