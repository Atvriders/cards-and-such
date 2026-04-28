import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LingoDeductionState, LingoDeductionAction, LingoDeductionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LingoDeductionGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const lingoDeductionPlugin: GamePlugin<LingoDeductionState, LingoDeductionAction, typeof settings> = {
  id: "lingo-deduction",
  title: "Lingo Deduction Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Lingo's TV-style word-guess letter feedback.`,
  howToPlay: `Lingo Deduction Quiz tests your knowledge of the TV game Lingo and its letter-feedback word-guess mechanics. Players guess a hidden 5-letter word; each guess reveals which letters are in the right place (yellow) and which are in the word but elsewhere (red), driving deduction toward the answer.

Across 10 multiple-choice questions you'll cover: how Lingo's feedback differs from Wordle, why the first letter is given for free in classic TV Lingo, optimal opening-word strategies, and the mathematics of information gained per guess.

Each correct answer is 100 points (1000 max).

Tips: in Lingo the first letter is shown at game start, so opening words should saturate vowels and common consonants in unknown positions. Avoid wasting guesses repeating known-eliminated letters. Information theory says words like SLATE and CRANE maximize expected info on guess one.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LingoDeductionSettings),
  reducer,
  isTerminal,
  component: LingoDeductionGame,
};
