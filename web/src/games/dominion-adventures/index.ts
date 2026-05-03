import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionAdventuresState, DominionAdventuresAction, DominionAdventuresSettings } from "./state.js";
import { DominionAdventures_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const DominionAdventuresGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DominionAdventuresGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const dominionAdventuresPlugin: GamePlugin<DominionAdventuresState, DominionAdventuresAction, typeof settings> = {
  id: "dominion-adventures",
  title: "Dominion: Adventures",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Token-based Dominion expansion.",
  howToPlay: "Dominion: Adventures is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DominionAdventuresSettings),
  reducer,
  isTerminal,
  hint: (state: DominionAdventuresState): HintTarget | null => {
    const sel = coopHintSelector(state, DominionAdventures_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: DominionAdventuresGame,
};

export default dominionAdventuresPlugin;
