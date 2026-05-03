import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TashKalarArenaState, TashKalarArenaAction, TashKalarArenaSettings } from "./state.js";
import { TashKalarArena_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const TashKalarArenaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TashKalarArenaGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const tashKalarArenaPlugin: GamePlugin<TashKalarArenaState, TashKalarArenaAction, typeof settings> = {
  id: "tash-kalar-arena",
  title: "Tash-Kalar: Arena",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pattern-summoning duel — coop variant.",
  howToPlay: "Tash-Kalar: Arena is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TashKalarArenaSettings),
  reducer,
  isTerminal,
  hint: (state: TashKalarArenaState): HintTarget | null => {
    const sel = coopHintSelector(state, TashKalarArena_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: TashKalarArenaGame,
};

export default tashKalarArenaPlugin;
