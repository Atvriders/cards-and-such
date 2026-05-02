import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArkhamLcgFellowState, ArkhamLcgFellowAction, ArkhamLcgFellowSettings } from "./state.js";
import { ArkhamLcgFellow_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { ArkhamLcgFellowGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const arkhamLcgFellowPlugin: GamePlugin<ArkhamLcgFellowState, ArkhamLcgFellowAction, typeof settings> = {
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
  hint: (state: ArkhamLcgFellowState): HintTarget | null => {
    const sel = coopHintSelector(state, ArkhamLcgFellow_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ArkhamLcgFellowGame,
};

export default arkhamLcgFellowPlugin;
