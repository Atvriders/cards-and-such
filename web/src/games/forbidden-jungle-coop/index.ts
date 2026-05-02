import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenJungleCoopState, ForbiddenJungleCoopAction, ForbiddenJungleCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenJungleCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbiddenJungleCoopPlugin: GamePlugin<ForbiddenJungleCoopState, ForbiddenJungleCoopAction, typeof settings> = {
  id: "forbidden-jungle-coop",
  title: "Forbidden Jungle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Escape an overgrown jungle before vines consume all.",
  howToPlay: "Forbidden Jungle is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenJungleCoopSettings),
  reducer,
  isTerminal,
  component: ForbiddenJungleCoopGame,
};

export default forbiddenJungleCoopPlugin;
