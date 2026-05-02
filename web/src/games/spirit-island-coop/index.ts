import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandCoopState, SpiritIslandCoopAction, SpiritIslandCoopSettings } from "./state.js";
import { SpiritIslandCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { SpiritIslandCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const spiritIslandCoopPlugin: GamePlugin<SpiritIslandCoopState, SpiritIslandCoopAction, typeof settings> = {
  id: "spirit-island-coop",
  title: "Spirit Island",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spirits defend their island from invading colonizers.",
  howToPlay: "Spirit Island is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandCoopSettings),
  reducer,
  isTerminal,
  hint: (state: SpiritIslandCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, SpiritIslandCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SpiritIslandCoopGame,
};

export default spiritIslandCoopPlugin;
