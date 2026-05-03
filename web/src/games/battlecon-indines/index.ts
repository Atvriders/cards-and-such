import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BattleconIndinesState, BattleconIndinesAction, BattleconIndinesSettings } from "./state.js";
import { BattleconIndines_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const BattleconIndinesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BattleconIndinesGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const battleconIndinesPlugin: GamePlugin<BattleconIndinesState, BattleconIndinesAction, typeof settings> = {
  id: "battlecon-indines",
  title: "BattleCON: Indines",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-pair fighting game.",
  howToPlay: "BattleCON: Indines is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BattleconIndinesSettings),
  reducer,
  isTerminal,
  hint: (state: BattleconIndinesState): HintTarget | null => {
    const sel = coopHintSelector(state, BattleconIndines_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: BattleconIndinesGame,
};

export default battleconIndinesPlugin;
