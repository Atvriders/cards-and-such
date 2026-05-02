import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicLegacyS2State, PandemicLegacyS2Action, PandemicLegacyS2Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicLegacyS2Game } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicLegacyS2Plugin: GamePlugin<PandemicLegacyS2State, PandemicLegacyS2Action, typeof settings> = {
  id: "pandemic-legacy-s2",
  title: "Pandemic Legacy S2",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Plague-ravaged future: rebuild from havens.",
  howToPlay: "Pandemic Legacy S2 is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicLegacyS2Settings),
  reducer,
  isTerminal,
  component: PandemicLegacyS2Game,
};

export default pandemicLegacyS2Plugin;
