import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicHotZoneNaState, PandemicHotZoneNaAction, PandemicHotZoneNaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicHotZoneNaGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemic_hot_zone_na_plugin: GamePlugin<PandemicHotZoneNaState, PandemicHotZoneNaAction, typeof settings> = {
  id: "pandemic-hot-zone-na",
  title: "Pandemic Hot Zone N.A.",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Faster Pandemic in three North American cities.",
  howToPlay: "Pandemic Hot Zone N.A. is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicHotZoneNaSettings),
  reducer,
  isTerminal,
  component: PandemicHotZoneNaGame,
};

export default pandemic_hot_zone_na_plugin;
