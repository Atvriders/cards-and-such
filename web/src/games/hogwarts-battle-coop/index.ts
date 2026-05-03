import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogwartsBattleCoopState, HogwartsBattleCoopAction, HogwartsBattleCoopSettings } from "./state.js";
import { HogwartsBattleCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const HogwartsBattleCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HogwartsBattleCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hogwartsBattleCoopPlugin: GamePlugin<HogwartsBattleCoopState, HogwartsBattleCoopAction, typeof settings> = {
  id: "hogwarts-battle-coop",
  title: "Harry Potter: Hogwarts Battle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Defend Hogwarts from villain takeovers.",
  howToPlay: "Harry Potter: Hogwarts Battle is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HogwartsBattleCoopSettings),
  reducer,
  isTerminal,
  hint: (state: HogwartsBattleCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, HogwartsBattleCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: HogwartsBattleCoopGame,
};

export default hogwartsBattleCoopPlugin;
