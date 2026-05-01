import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicBaseState, PandemicBaseAction, PandemicBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicBaseGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Intro", "Standard", "Heroic"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicBasePlugin: GamePlugin<PandemicBaseState, PandemicBaseAction, typeof settings> = {
  id: "pandemic-base",
  title: "Pandemic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative disease control around the globe.",
  howToPlay: "Pandemic adapted for solo: each round pick a tactic — Treat, Research, Fly, or Build — and you plus an AI medic apply effort toward Cures while infections rise. Reach 60 cures before infections cause four outbreaks to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicBaseSettings),
  reducer,
  isTerminal,
  component: PandemicBaseGame,
};

export default pandemicBasePlugin;
