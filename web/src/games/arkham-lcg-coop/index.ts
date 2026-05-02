import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArkhamLcgCoopState, ArkhamLcgCoopAction, ArkhamLcgCoopSettings } from "./state.js";
import { ArkhamLcgCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { ArkhamLcgCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const arkhamLcgCoopPlugin: GamePlugin<ArkhamLcgCoopState, ArkhamLcgCoopAction, typeof settings> = {
  id: "arkham-lcg-coop",
  title: "Arkham Horror LCG",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mythos investigators stop creeping horrors.",
  howToPlay: "Arkham Horror LCG is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArkhamLcgCoopSettings),
  reducer,
  isTerminal,
  hint: (state: ArkhamLcgCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, ArkhamLcgCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ArkhamLcgCoopGame,
};

export default arkhamLcgCoopPlugin;
