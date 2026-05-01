import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenDesertCoopState, ForbiddenDesertCoopAction, ForbiddenDesertCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenDesertCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const forbidden_desert_coop_plugin: GamePlugin<ForbiddenDesertCoopState, ForbiddenDesertCoopAction, typeof settings> = {
  id: "forbidden-desert-coop",
  title: "Forbidden Desert",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Assemble a flying machine before the sand buries you.",
  howToPlay: "Forbidden Desert is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenDesertCoopSettings),
  reducer,
  isTerminal,
  component: ForbiddenDesertCoopGame,
};

export default forbidden_desert_coop_plugin;
