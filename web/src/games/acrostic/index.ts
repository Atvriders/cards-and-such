import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcrosticState, AcrosticAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Acrostic } from "./Acrostic.js";

export const acrosticSettings = {} as const;

type AcrosticSettingsType = SettingsOf<typeof acrosticSettings>;

export const acrosticPlugin: GamePlugin<AcrosticState, AcrosticAction, typeof acrosticSettings> = {
  id: "acrostic",
  title: "Acrostic Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve clues whose first letters spell out an author's name hidden in a famous quote.",
  howToPlay: `An Acrostic Puzzle combines a famous quote with a set of subsidiary clues. Each clue has a one-word answer, and the first letter of each answer spells out the name of the person who said the quote.

At the top of the screen you will see the full quote along with the author's name displayed as individual letters. Below that are five numbered clues, each labeled with the letter that answer must begin with.

Click any clue row to select it — the selected row is highlighted in blue. Then type your answer on the keyboard. Press Backspace to delete the last letter, or Clear to wipe the whole answer. You can switch between clues at any time by clicking a different row.

When you are confident in all your answers, click Check Answers. Correct answers turn green; incorrect ones turn red. Your score is the percentage of clues answered correctly, expressed as a number from 0 to 100.

The quote and clue set are randomly chosen from a collection of hand-designed puzzles, each featuring a well-known author or historical figure. Tips: the initial letter shown next to each clue number is a strong hint — use it to narrow down candidates. If you get stuck, try working backward from what you know of the quote's author.`,
  settings: acrosticSettings,
  initialState: (seed: number, settings: AcrosticSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Acrostic,
};
