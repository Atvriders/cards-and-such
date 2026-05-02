import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EscapeAliensHiddenState, EscapeAliensHiddenAction, EscapeAliensHiddenSettings } from "./state.js";
import { EscapeAliensHidden_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { EscapeAliensHiddenGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const escapeAliensHiddenPlugin: GamePlugin<EscapeAliensHiddenState, EscapeAliensHiddenAction, typeof settings> = {
  id: "escape-aliens-hidden",
  title: "Escape: Curse of the Aliens",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hidden-movement coop on a doomed ship.",
  howToPlay: "Escape: Curse of the Aliens is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EscapeAliensHiddenSettings),
  reducer,
  isTerminal,
  hint: (state: EscapeAliensHiddenState): HintTarget | null => {
    const sel = coopHintSelector(state, EscapeAliensHidden_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: EscapeAliensHiddenGame,
};

export default escapeAliensHiddenPlugin;
