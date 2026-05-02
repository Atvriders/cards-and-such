import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TempelTrapState, TempelTrapAction, TempelTrapSettings } from "./state.js";
import { TempelTrap_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { TempelTrapGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tempelTrapPlugin: GamePlugin<TempelTrapState, TempelTrapAction, typeof settings> = {
  id: "tempel-trap",
  title: "Tempel: Traps",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Avoid the four traps.",
  howToPlay: "Tempel: Traps adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TempelTrapSettings),
  reducer,
  isTerminal,
  hint: (state: TempelTrapState): HintTarget | null => {
    const sel = deductionHintSelector(state, TempelTrap_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: TempelTrapGame,
};

export default tempelTrapPlugin;
