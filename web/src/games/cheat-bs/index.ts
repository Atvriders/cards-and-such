import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheatBsState, CheatBsAction, CheatBsSettings } from "./state.js";
import { CheatBs_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { CheatBsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cheatBsPlugin: GamePlugin<CheatBsState, CheatBsAction, typeof settings> = {
  id: "cheat-bs",
  title: "Cheat / BS",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the bluff.",
  howToPlay: "Cheat / BS adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CheatBsSettings),
  reducer,
  isTerminal,
  hint: (state: CheatBsState): HintTarget | null => {
    const sel = deductionHintSelector(state, CheatBs_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CheatBsGame,
};

export default cheatBsPlugin;
