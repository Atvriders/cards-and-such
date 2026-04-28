import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonikersQuizState, MonikersQuizAction, MonikersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonikersQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const monikersQuizPlugin: GamePlugin<MonikersQuizState, MonikersQuizAction, typeof settings> = {
  id: "monikers-quiz",
  title: "Monikers Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Monikers, the three-round name-game with a deck of weird people.",
  howToPlay: "Monikers Trivia explores the three-round party hit by CMYK Games, where the same set of names cycles through ever-tighter description constraints. Round one allows free description; round two only one word; round three only gestures and charades.\n\nYou'll answer ten multiple-choice questions about the game's structure, its publisher, the deck's iconic absurdity, the famous Kickstarter origins, and how the three-round arc creates running jokes that get funnier with each pass.\n\nChoose A, B, C, or D for each prompt and press Submit. A correct answer scores 100 points; a wrong answer earns zero and reveals the correct choice. After each question press Next to continue, or Finish on the last.\n\nQuestions cover scoring, team composition, the Serious Nonsense expansion, recommended player counts, and the famous celebrities and historical figures that fill out the character deck.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonikersQuizSettings),
  reducer, isTerminal, component: MonikersQuizGame,
};
