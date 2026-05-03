import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndMagesState, AeonsEndMagesAction, AeonsEndMagesSettings } from "./state.js";
import { AeonsEndMages_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const AeonsEndMagesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AeonsEndMagesGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const aeonsEndMagesPlugin: GamePlugin<AeonsEndMagesState, AeonsEndMagesAction, typeof settings> = {
  id: "aeons-end-mages",
  title: "Aeon's End: Mages",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spell-slinging mages defend Gravehold from the Nameless.",
  howToPlay: "Aeon's End: Mages is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndMagesSettings),
  reducer,
  isTerminal,
  hint: (state: AeonsEndMagesState): HintTarget | null => {
    const sel = coopHintSelector(state, AeonsEndMages_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: AeonsEndMagesGame,
};

export default aeonsEndMagesPlugin;
