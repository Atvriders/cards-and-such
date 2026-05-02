import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PrefixQuizState, PrefixQuizAction, PrefixQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PrefixQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const prefixQuizPlugin: GamePlugin<PrefixQuizState, PrefixQuizAction, typeof settings> = {
  id: "prefix-quiz", title: "Prefix Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the prefix and what it means in English vocabulary.",
  howToPlay: `Prefix Quiz tests your knowledge of English prefixes — letters added to the start of a word to change its meaning. Each question asks about a common prefix's meaning, or which prefix forms a target word.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Mastering prefixes unlocks thousands of vocabulary words — once you know 'pre-' means 'before', words like 'preview', 'predict', and 'preface' click instantly. Whether you are studying for school, prepping standardized tests, or just curious about etymology, Prefix Quiz sharpens your wordcraft. Build skills, score points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PrefixQuizSettings),
  reducer, isTerminal, 
  hint: (state: PrefixQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PrefixQuizGame,
};
