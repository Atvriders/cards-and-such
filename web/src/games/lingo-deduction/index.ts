import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LingoDeductionState, LingoDeductionAction, LingoDeductionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LingoDeductionGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const lingo_deduction_plugin: GamePlugin<LingoDeductionState, LingoDeductionAction, typeof settings> = {
  id: "lingo-deduction",
  title: "Lingo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-letter word deduction.",
  howToPlay: "Lingo adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LingoDeductionSettings),
  reducer,
  isTerminal,
  component: LingoDeductionGame,
};

export default lingo_deduction_plugin;
