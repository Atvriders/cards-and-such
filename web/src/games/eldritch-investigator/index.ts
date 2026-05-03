import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EldritchInvestigatorState, EldritchInvestigatorAction, EldritchInvestigatorSettings } from "./state.js";
import { EldritchInvestigator_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const EldritchInvestigatorGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EldritchInvestigatorGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const eldritchInvestigatorPlugin: GamePlugin<EldritchInvestigatorState, EldritchInvestigatorAction, typeof settings> = {
  id: "eldritch-investigator",
  title: "Eldritch Horror: Investigator",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Globe-trotting Lovecraftian investigators.",
  howToPlay: "Eldritch Horror: Investigator is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EldritchInvestigatorSettings),
  reducer,
  isTerminal,
  hint: (state: EldritchInvestigatorState): HintTarget | null => {
    const sel = coopHintSelector(state, EldritchInvestigator_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: EldritchInvestigatorGame,
};

export default eldritchInvestigatorPlugin;
