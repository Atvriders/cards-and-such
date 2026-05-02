import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenSkyCoopState, ForbiddenSkyCoopAction, ForbiddenSkyCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenSkyCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbiddenSkyCoopPlugin: GamePlugin<ForbiddenSkyCoopState, ForbiddenSkyCoopAction, typeof settings> = {
  id: "forbidden-sky-coop",
  title: "Forbidden Sky",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a rocket on a thunderhead and escape.",
  howToPlay: "Forbidden Sky is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenSkyCoopSettings),
  reducer,
  isTerminal,
  component: ForbiddenSkyCoopGame,
};

export default forbiddenSkyCoopPlugin;
