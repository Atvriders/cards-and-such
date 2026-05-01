import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArkhamLcgFellowState, ArkhamLcgFellowAction, ArkhamLcgFellowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArkhamLcgFellowGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const arkham_lcg_fellow_plugin: GamePlugin<ArkhamLcgFellowState, ArkhamLcgFellowAction, typeof settings> = {
  id: "arkham-lcg-fellow",
  title: "Arkham LCG: Fellowship",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arkham LCG cooperative fellowship campaign.",
  howToPlay: "Arkham LCG: Fellowship is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArkhamLcgFellowSettings),
  reducer,
  isTerminal,
  component: ArkhamLcgFellowGame,
};

export default arkham_lcg_fellow_plugin;
