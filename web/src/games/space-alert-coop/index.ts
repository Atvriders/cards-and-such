import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpaceAlertCoopState, SpaceAlertCoopAction, SpaceAlertCoopSettings } from "./state.js";
import { SpaceAlertCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { SpaceAlertCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const spaceAlertCoopPlugin: GamePlugin<SpaceAlertCoopState, SpaceAlertCoopAction, typeof settings> = {
  id: "space-alert-coop",
  title: "Space Alert",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real-time spaceship coop.",
  howToPlay: "Space Alert is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpaceAlertCoopSettings),
  reducer,
  isTerminal,
  hint: (state: SpaceAlertCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, SpaceAlertCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SpaceAlertCoopGame,
};

export default spaceAlertCoopPlugin;
