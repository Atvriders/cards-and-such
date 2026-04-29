import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SynonymQuizState, SynonymQuizAction, SynonymQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SynonymQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const synonymQuizPlugin: GamePlugin<SynonymQuizState, SynonymQuizAction, typeof settings> = {
  id: "synonym-quiz", title: "Synonym Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the word that means most nearly the same as the given word.",
  howToPlay: `Synonym Quiz tests your vocabulary by asking you to identify the closest synonym for a given word from four choices. You will face questions covering common, intermediate, and slightly advanced English vocabulary — adjectives, verbs, and nouns alike.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Whether you are sharpening for a vocabulary test, padding your daily word workout, or just having fun with English, Synonym Quiz keeps your mind nimble. Build vocabulary, score points, and beat your best streak!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SynonymQuizSettings),
  reducer, isTerminal, component: SynonymQuizGame,
};
