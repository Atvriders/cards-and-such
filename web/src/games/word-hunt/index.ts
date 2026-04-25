import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WordHuntState, WordHuntAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordHunt } from "./Game.js";

export const wordHuntSettings = {} as const;

export const wordHuntPlugin: GamePlugin<WordHuntState, WordHuntAction, typeof wordHuntSettings> = {
  id: "word-hunt",
  title: "Word Hunt",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race the clock to name as many words in the given category as you can!",
  howToPlay: `Word Hunt is a fast-paced category naming game. Each round you are given a category — like Animals, Colors, Countries, or Musical Instruments — and 90 seconds to name as many words in that category as you can.

Type a word that belongs to the category and press Enter or tap Go. If it is on the list, it is added to your found-words panel and you earn points based on its length (letter count × 5, minimum 5 points). Longer words earn more.

Words must match the game's built-in list for that category — the list contains at least 30 entries, so there are always plenty to find. You cannot score the same word twice.

The category and hint are shown at the top of the screen. The timer counts down from 90 seconds; when it hits zero the game ends and your score is tallied.

Choose a 90-second session from the settings, and each play draws a new random category.

Tips: start with short common words you know immediately, then reach for longer or more obscure ones to maximize points. If you are stuck, scan the alphabet mentally — what starts with A, B, C for this category? The breadth of the category means there are always more answers than you expect.`,
  settings: wordHuntSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: WordHunt,
};
