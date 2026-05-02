import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrizzledOrdersState, GrizzledOrdersAction, GrizzledOrdersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrizzledOrdersGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const grizzledOrdersPlugin: GamePlugin<GrizzledOrdersState, GrizzledOrdersAction, typeof settings> = {
  id: "grizzled-orders",
  title: "The Grizzled: Orders",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Armistice add-on missions for The Grizzled.",
  howToPlay: "The Grizzled: Orders is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrizzledOrdersSettings),
  reducer,
  isTerminal,
  component: GrizzledOrdersGame,
};

export default grizzledOrdersPlugin;
