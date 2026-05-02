import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BullsAndCowsState, BullsAndCowsAction, BullsAndCowsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BullsAndCowsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bullsAndCowsPlugin: GamePlugin<BullsAndCowsState, BullsAndCowsAction, typeof settings> = {
  id: "bulls-and-cows",
  title: "Bulls and Cows",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Numeric Mastermind: bulls = exact, cows = misplaced.",
  howToPlay: "Bulls and Cows adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BullsAndCowsSettings),
  reducer,
  isTerminal,
  component: BullsAndCowsGame,
};

export default bullsAndCowsPlugin;
