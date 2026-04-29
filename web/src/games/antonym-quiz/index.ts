import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AntonymQuizState, AntonymQuizAction, AntonymQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AntonymQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const antonymQuizPlugin: GamePlugin<AntonymQuizState, AntonymQuizAction, typeof settings> = {
  id: "antonym-quiz", title: "Antonym Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the word that means the opposite of the given word.",
  howToPlay: `Antonym Quiz tests your vocabulary by asking you to pick the word that means the opposite of a given word. Questions cover common to intermediate vocabulary across adjectives, verbs, and nouns.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Antonyms are the foundation of nuance in English; mastering them sharpens your reading comprehension and writing precision. Whether you are prepping for a standardized test or just stretching your brain, Antonym Quiz keeps you guessing and learning. Build vocabulary, score points, and beat your best streak!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AntonymQuizSettings),
  reducer, isTerminal, component: AntonymQuizGame,
};
