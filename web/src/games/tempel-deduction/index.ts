import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TempelDeductionState, TempelDeductionAction, TempelDeductionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TempelDeductionGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tempel_deduction_plugin: GamePlugin<TempelDeductionState, TempelDeductionAction, typeof settings> = {
  id: "tempel-deduction",
  title: "Tempel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the temple's hidden treasures.",
  howToPlay: "Tempel adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TempelDeductionSettings),
  reducer,
  isTerminal,
  component: TempelDeductionGame,
};

export default tempel_deduction_plugin;
