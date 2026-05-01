import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConceptDeductionState, ConceptDeductionAction, ConceptDeductionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConceptDeductionGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const concept_deduction_plugin: GamePlugin<ConceptDeductionState, ConceptDeductionAction, typeof settings> = {
  id: "concept-deduction",
  title: "Concept",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce the concept from icons.",
  howToPlay: "Concept adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConceptDeductionSettings),
  reducer,
  isTerminal,
  component: ConceptDeductionGame,
};

export default concept_deduction_plugin;
