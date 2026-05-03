import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionIntrigueState, DominionIntrigueAction, DominionIntrigueSettings } from "./state.js";
import { DominionIntrigue_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const DominionIntrigueGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DominionIntrigueGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const dominionIntriguePlugin: GamePlugin<DominionIntrigueState, DominionIntrigueAction, typeof settings> = {
  id: "dominion-intrigue",
  title: "Dominion: Intrigue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Court-intrigue Dominion expansion.",
  howToPlay: "Dominion: Intrigue is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DominionIntrigueSettings),
  reducer,
  isTerminal,
  hint: (state: DominionIntrigueState): HintTarget | null => {
    const sel = coopHintSelector(state, DominionIntrigue_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: DominionIntrigueGame,
};

export default dominionIntriguePlugin;
