import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsEnvironmentState, SentinelsEnvironmentAction, SentinelsEnvironmentSettings } from "./state.js";
import { SentinelsEnvironment_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { SentinelsEnvironmentGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const sentinelsEnvironmentPlugin: GamePlugin<SentinelsEnvironmentState, SentinelsEnvironmentAction, typeof settings> = {
  id: "sentinels-environment",
  title: "Sentinels: Environment Mode",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Environment-focused Sentinels variant.",
  howToPlay: "Sentinels: Environment Mode is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsEnvironmentSettings),
  reducer,
  isTerminal,
  hint: (state: SentinelsEnvironmentState): HintTarget | null => {
    const sel = coopHintSelector(state, SentinelsEnvironment_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SentinelsEnvironmentGame,
};

export default sentinelsEnvironmentPlugin;
