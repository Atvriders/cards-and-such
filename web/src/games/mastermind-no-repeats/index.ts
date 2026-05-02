import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MastermindNoRepeatsState, MastermindNoRepeatsAction, MastermindNoRepeatsSettings } from "./state.js";
import { MastermindNoRepeats_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { MastermindNoRepeatsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mastermindNoRepeatsPlugin: GamePlugin<MastermindNoRepeatsState, MastermindNoRepeatsAction, typeof settings> = {
  id: "mastermind-no-repeats",
  title: "Mastermind No Repeats",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mastermind without repeated colours.",
  howToPlay: "Mastermind No Repeats adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MastermindNoRepeatsSettings),
  reducer,
  isTerminal,
  hint: (state: MastermindNoRepeatsState): HintTarget | null => {
    const sel = deductionHintSelector(state, MastermindNoRepeats_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MastermindNoRepeatsGame,
};

export default mastermindNoRepeatsPlugin;
