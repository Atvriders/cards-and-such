import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndWarEternalState, AeonsEndWarEternalAction, AeonsEndWarEternalSettings } from "./state.js";
import { AeonsEndWarEternal_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { AeonsEndWarEternalGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const aeonsEndWarEternalPlugin: GamePlugin<AeonsEndWarEternalState, AeonsEndWarEternalAction, typeof settings> = {
  id: "aeons-end-war-eternal",
  title: "Aeon's End: War Eternal",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stand-alone Aeon's End with new mages.",
  howToPlay: "Aeon's End: War Eternal is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndWarEternalSettings),
  reducer,
  isTerminal,
  hint: (state: AeonsEndWarEternalState): HintTarget | null => {
    const sel = coopHintSelector(state, AeonsEndWarEternal_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: AeonsEndWarEternalGame,
};

export default aeonsEndWarEternalPlugin;
