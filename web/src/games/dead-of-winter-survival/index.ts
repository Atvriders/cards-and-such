import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, DeadOfWinterSurvivalSettings } from "./state.js";
import { DeadOfWinterSurvival_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { DeadOfWinterSurvivalGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const deadOfWinterSurvivalPlugin: GamePlugin<DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, typeof settings> = {
  id: "dead-of-winter-survival",
  title: "Dead of Winter: Survival",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Colonists survive zombie winter, secret betrayer possible.",
  howToPlay: "Dead of Winter: Survival is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeadOfWinterSurvivalSettings),
  reducer,
  isTerminal,
  hint: (state: DeadOfWinterSurvivalState): HintTarget | null => {
    const sel = coopHintSelector(state, DeadOfWinterSurvival_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: DeadOfWinterSurvivalGame,
};

export default deadOfWinterSurvivalPlugin;
