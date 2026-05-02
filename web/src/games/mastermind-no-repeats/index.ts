import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MastermindNoRepeatsState, MastermindNoRepeatsAction, MastermindNoRepeatsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
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
  component: MastermindNoRepeatsGame,
};

export default mastermindNoRepeatsPlugin;
