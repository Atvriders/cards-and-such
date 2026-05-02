import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AlliterationQuizState, AlliterationQuizAction, AlliterationQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AlliterationQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const alliterationQuizPlugin: GamePlugin<AlliterationQuizState, AlliterationQuizAction, typeof settings> = {
  id: "alliteration-quiz", title: "Alliteration Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify alliterative phrases — repeated initial consonant sounds.",
  howToPlay: `Alliteration Quiz tests your eye and ear for alliteration — repeated initial consonant sounds within a phrase. Each question presents four phrases; only one uses true alliteration (or asks which letter alliterates).

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Alliteration powers tongue-twisters ('Peter Piper picked a peck'), advertising slogans ('Coca-Cola'), and poetry. Spotting it improves your writing rhythm and reading enjoyment. Whether for school or fun, Alliteration Quiz makes you listen for music in language. Score points, sharpen ears!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AlliterationQuizSettings),
  reducer, isTerminal, 
  hint: (state: AlliterationQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: AlliterationQuizGame,
};
