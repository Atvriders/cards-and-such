import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DisneyMemoryState, DisneyMemoryAction, DisneyMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DisneyMemoryGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const disneyMemoryPlugin: GamePlugin<DisneyMemoryState, DisneyMemoryAction, typeof settings> = {
  id: "disney-memory",
  title: "Disney Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match Disney character pairs.",
  howToPlay: "Disney Memory is a memory and observation challenge built around quick recall. Each of fifteen rounds shows a brief prompt referencing one item from a fixed pool of cards, and asks you to pick the matching name from four candidates. Correct answers earn ten points (max 150), and the answer is revealed each round so you can learn the pool over time.\n\nThe game pool is fixed — every round draws from the same set of items, so as you play you build familiarity. Read the prompt carefully; the cue may describe a visual feature, a category, or a trait. Click your answer, then Submit to lock, then Next to advance. Wrong picks show the correct answer in green and your guess in red. There is no time pressure, so take a moment to scan options before committing.\n\nStrong scores are 130+; perfect 150 requires careful attention to detail. Use this game to train pattern recognition, observational accuracy, and memory association — skills that transfer to all matching, recall, and trivia games. Good luck!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DisneyMemorySettings),
  reducer,
  isTerminal,
  component: DisneyMemoryGame,
};
