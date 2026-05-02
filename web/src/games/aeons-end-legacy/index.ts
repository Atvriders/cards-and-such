import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndLegacyState, AeonsEndLegacyAction, AeonsEndLegacySettings } from "./state.js";
import { AeonsEndLegacy_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { AeonsEndLegacyGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const aeonsEndLegacyPlugin: GamePlugin<AeonsEndLegacyState, AeonsEndLegacyAction, typeof settings> = {
  id: "aeons-end-legacy",
  title: "Aeon's End Legacy",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aeon's End campaign with persistent upgrades.",
  howToPlay: "Aeon's End Legacy is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndLegacySettings),
  reducer,
  isTerminal,
  hint: (state: AeonsEndLegacyState): HintTarget | null => {
    const sel = coopHintSelector(state, AeonsEndLegacy_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: AeonsEndLegacyGame,
};

export default aeonsEndLegacyPlugin;
