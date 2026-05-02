import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BurgleBrosMultiState, BurgleBrosMultiAction, BurgleBrosMultiSettings } from "./state.js";
import { BurgleBrosMulti_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { BurgleBrosMultiGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const burgleBrosMultiPlugin: GamePlugin<BurgleBrosMultiState, BurgleBrosMultiAction, typeof settings> = {
  id: "burgle-bros-multi",
  title: "Burgle Bros: Multi-Heist",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Linked-heist Burgle Bros campaign.",
  howToPlay: "Burgle Bros: Multi-Heist is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BurgleBrosMultiSettings),
  reducer,
  isTerminal,
  hint: (state: BurgleBrosMultiState): HintTarget | null => {
    const sel = coopHintSelector(state, BurgleBrosMulti_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: BurgleBrosMultiGame,
};

export default burgleBrosMultiPlugin;
