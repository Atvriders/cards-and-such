import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThirteenCluesState, ThirteenCluesAction, ThirteenCluesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThirteenCluesGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const thirteenCluesPlugin: GamePlugin<ThirteenCluesState, ThirteenCluesAction, typeof settings> = {
  id: "thirteen-clues",
  title: "13 Clues Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on the inverse-deduction party game 13 Clues.`,
  howToPlay: `13 Clues Quiz tests your knowledge of Daniel Pinkston's inverse-deduction game. Each player can see everyone else's solution but not their own — using clue cards and yes/no questions, you deduce the suspect, weapon, and location of your own crime.

Across 10 multiple-choice questions you'll cover: how clue cards work, why Sherlock and Watson cards add public information, optimal questioning strategy, why narrowing one category at a time is efficient, and how the rumour token speeds up deduction at endgame.

Each correct answer awards 100 points (1000 max).

Tips: in 13 Clues the central public clue cards (Sherlock and Watson) flatten information — early in the game, ask broad questions; late game, ask narrow ones. Always note which clue cards exclude your own suspect. The game ends as soon as one player correctly deduces all three of their own crime's elements.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThirteenCluesSettings),
  reducer,
  isTerminal,
  component: ThirteenCluesGame,
};
