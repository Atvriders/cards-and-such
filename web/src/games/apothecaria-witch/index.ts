import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApothecariaWitchState, ApothecariaWitchAction, ApothecariaWitchSettings } from "./state.js";
import { ApothecariaWitch_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const ApothecariaWitchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ApothecariaWitchGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const apothecariaWitchPlugin: GamePlugin<ApothecariaWitchState, ApothecariaWitchAction, typeof settings> = {
  id: "apothecaria-witch",
  title: "Apothecaria: Witch",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo witch-apothecary brewing campaign.",
  howToPlay: "Apothecaria: Witch is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApothecariaWitchSettings),
  reducer,
  isTerminal,
  hint: (state: ApothecariaWitchState): HintTarget | null => {
    const sel = coopHintSelector(state, ApothecariaWitch_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ApothecariaWitchGame,
};

export default apothecariaWitchPlugin;
