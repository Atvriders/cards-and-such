import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicIberiaState, PandemicIberiaAction, PandemicIberiaSettings } from "./state.js";
import { PandemicIberia_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { PandemicIberiaGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicIberiaPlugin: GamePlugin<PandemicIberiaState, PandemicIberiaAction, typeof settings> = {
  id: "pandemic-iberia",
  title: "Pandemic: Iberia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quell disease in 19th-century Iberia.",
  howToPlay: "Pandemic: Iberia is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicIberiaSettings),
  reducer,
  isTerminal,
  hint: (state: PandemicIberiaState): HintTarget | null => {
    const sel = coopHintSelector(state, PandemicIberia_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: PandemicIberiaGame,
};

export default pandemicIberiaPlugin;
