import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsDefinitiveState, SentinelsDefinitiveAction, SentinelsDefinitiveSettings } from "./state.js";
import { SentinelsDefinitive_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { SentinelsDefinitiveGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const sentinelsDefinitivePlugin: GamePlugin<SentinelsDefinitiveState, SentinelsDefinitiveAction, typeof settings> = {
  id: "sentinels-definitive",
  title: "Sentinels: Definitive Edition",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Definitive Edition revamp of Sentinels.",
  howToPlay: "Sentinels: Definitive Edition is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsDefinitiveSettings),
  reducer,
  isTerminal,
  hint: (state: SentinelsDefinitiveState): HintTarget | null => {
    const sel = coopHintSelector(state, SentinelsDefinitive_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SentinelsDefinitiveGame,
};

export default sentinelsDefinitivePlugin;
