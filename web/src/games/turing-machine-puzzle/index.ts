import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TuringMachinePuzzleState, TuringMachinePuzzleAction, TuringMachinePuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TuringMachinePuzzleGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const turing_machine_puzzle_plugin: GamePlugin<TuringMachinePuzzleState, TuringMachinePuzzleAction, typeof settings> = {
  id: "turing-machine-puzzle",
  title: "Turing Machine",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-digit logic deduction.",
  howToPlay: "Turing Machine adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TuringMachinePuzzleSettings),
  reducer,
  isTerminal,
  component: TuringMachinePuzzleGame,
};

export default turing_machine_puzzle_plugin;
