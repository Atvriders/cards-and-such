import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PhrasePuzzleState, PhrasePuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PhrasePuzzle } from "./Game.js";

export const phrasePuzzleSettings = {} as const;

export const phrasePuzzlePlugin: GamePlugin<PhrasePuzzleState, PhrasePuzzleAction, typeof phrasePuzzleSettings> = {
  id: "phrase-puzzle",
  title: "Phrase Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill in the missing letters of famous phrases, proverbs, and sayings!",
  howToPlay: `Phrase Puzzle presents well-known English phrases, proverbs, and famous quotations with some of their letters hidden. Your job is to fill in every blank to complete the phrase.

Each puzzle shows the category (Proverb, Idiom, Shakespeare, etc.) and a short contextual hint so you know roughly what the phrase is about. About 40 percent of the letters are blanked out — enough to make it challenging but not impossible.

Click any blank box and type a single letter to fill it in. You can move between blanks by clicking them in any order. When you are happy with your answer, click Check. Correct answers are shown in green; an incorrect submission reveals the full phrase in red so you can learn from it.

After each result — whether correct or wrong — click Next to advance to the following phrase. There are 8 phrases per game, drawn randomly from a bank of 45 sayings.

Score is 100 points per correctly solved phrase, for a maximum of 800 per game.

Tips: read the hint first to narrow down the genre. Short words around the blanks often give enough context. Common words like THE, AND, IS, A can usually be spotted quickly, anchoring the rest of the phrase.`,
  settings: phrasePuzzleSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: PhrasePuzzle,
};
