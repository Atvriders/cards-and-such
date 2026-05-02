import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicBaseState, PandemicBaseAction, PandemicBaseSettings } from "./state.js";
import { PandemicBase_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { PandemicBaseGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Intro", "Standard", "Heroic"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const pandemicBasePlugin: GamePlugin<PandemicBaseState, PandemicBaseAction, typeof settings> = {
  id: "pandemic-base",
  title: "Pandemic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative disease control around the globe.",
  howToPlay: "Pandemic adapted for solo: each round pick a tactic — Treat, Research, Fly, or Build — and you plus an AI medic apply effort toward Cures while infections rise. Reach 60 cures before infections cause four outbreaks to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicBaseSettings),
  reducer,
  isTerminal,
  hint: (state: PandemicBaseState): HintTarget | null => {
    const sel = coopHintSelector(state, PandemicBase_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: PandemicBaseGame,
};

export default pandemicBasePlugin;
