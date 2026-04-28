import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TuringMachinePuzzleState, TuringMachinePuzzleAction, TuringMachinePuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TuringMachinePuzzleGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const turingMachinePuzzlePlugin: GamePlugin<TuringMachinePuzzleState, TuringMachinePuzzleAction, typeof settings> = {
  id: "turing-machine-puzzle",
  title: "Turing Machine Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Turing Machine's pure-logic 3-digit code-cracking.`,
  howToPlay: `Turing Machine Strategy Quiz tests your knowledge of the 2022 logic-deduction game by Yoann Levet and Fabien Gridel. Players use punch-card "verifiers" to test 3-digit guesses without ever seeing the answer directly — each verifier card encodes a comparison rule.

Across 10 multiple-choice questions you'll cover: how verifiers work, why the puzzle is solvable purely by logic with no luck, what happens when contradictory verifier results appear, and standard solver strategies (eliminate broadly first, narrow last).

Each correct answer is 100 points (1000 max).

Tips: in real Turing Machine, every guess costs you a verifier check — being efficient with checks is the heart of the game. Always plan a guess that distinguishes between the two most-likely remaining hypotheses, not one that confirms the obvious. The hardest puzzles use 6 verifiers; the easiest use 4.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TuringMachinePuzzleSettings),
  reducer,
  isTerminal,
  component: TuringMachinePuzzleGame,
};
