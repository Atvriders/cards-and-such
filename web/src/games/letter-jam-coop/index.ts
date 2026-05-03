import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LetterJamCoopState, LetterJamCoopAction, LetterJamCoopSettings } from "./state.js";
import { LetterJamCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const LetterJamCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LetterJamCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const letterJamCoopPlugin: GamePlugin<LetterJamCoopState, LetterJamCoopAction, typeof settings> = {
  id: "letter-jam-coop",
  title: "Letter Jam",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Word-clue cooperative deduction.",
  howToPlay: "Letter Jam is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LetterJamCoopSettings),
  reducer,
  isTerminal,
  hint: (state: LetterJamCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, LetterJamCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: LetterJamCoopGame,
};

export default letterJamCoopPlugin;
