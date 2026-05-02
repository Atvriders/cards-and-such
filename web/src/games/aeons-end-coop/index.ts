import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndCoopState, AeonsEndCoopAction, AeonsEndCoopSettings } from "./state.js";
import { AeonsEndCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { AeonsEndCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const aeonsEndCoopPlugin: GamePlugin<AeonsEndCoopState, AeonsEndCoopAction, typeof settings> = {
  id: "aeons-end-coop",
  title: "Aeon's End Coop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aeon's End cooperative format.",
  howToPlay: "Aeon's End Coop is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndCoopSettings),
  reducer,
  isTerminal,
  hint: (state: AeonsEndCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, AeonsEndCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: AeonsEndCoopGame,
};

export default aeonsEndCoopPlugin;
