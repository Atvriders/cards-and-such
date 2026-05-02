import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicFallOfRomeState, PandemicFallOfRomeAction, PandemicFallOfRomeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicFallOfRomeGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicFallOfRomePlugin: GamePlugin<PandemicFallOfRomeState, PandemicFallOfRomeAction, typeof settings> = {
  id: "pandemic-fall-of-rome",
  title: "Pandemic: Fall of Rome",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Defend Rome from invading barbarian tribes.",
  howToPlay: "Pandemic: Fall of Rome is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicFallOfRomeSettings),
  reducer,
  isTerminal,
  component: PandemicFallOfRomeGame,
};

export default pandemicFallOfRomePlugin;
