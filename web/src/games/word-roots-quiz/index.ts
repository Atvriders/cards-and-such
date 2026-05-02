import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordRootsQuizState, WordRootsQuizAction, WordRootsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordRootsQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wordRootsQuizPlugin: GamePlugin<WordRootsQuizState, WordRootsQuizAction, typeof settings> = {
  id: "word-roots-quiz", title: "Word Roots Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the meaning of Greek and Latin word roots used in English.",
  howToPlay: `Word Roots Quiz tests your knowledge of the Greek and Latin roots that form thousands of English words. Each question asks the meaning of a root or which root appears in a given word.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Knowing roots unlocks the meaning of words you have never seen — once you learn 'aqua' means water, 'aquatic', 'aquarium', and 'aqueduct' all click. Whether you are studying medicine, law, or just expanding vocabulary, Word Roots Quiz is a powerful tool. Build skills, score big!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WordRootsQuizSettings),
  reducer, isTerminal, 
  hint: (state: WordRootsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: WordRootsQuizGame,
};
