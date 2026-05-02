import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpellingQuizState, SpellingQuizAction, SpellingQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpellingQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spellingQuizPlugin: GamePlugin<SpellingQuizState, SpellingQuizAction, typeof settings> = {
  id: "spelling-quiz", title: "Spelling Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the correctly spelled word from four options.",
  howToPlay: `Spelling Quiz tests your spelling chops by asking which of four spellings is correct. Words range across commonly misspelled English vocabulary — silent letters, double consonants, tricky vowel pairs, and homophones.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

English spelling is famously unpredictable — 'accommodate', 'embarrass', 'occurrence', 'rhythm'. Practising builds muscle memory and exam confidence. Whether prepping for a spelling bee, a school test, or just love wordcraft, Spelling Quiz delivers a workout that keeps your inner editor sharp. Score points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpellingQuizSettings),
  reducer, isTerminal, 
  hint: (state: SpellingQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: SpellingQuizGame,
};
