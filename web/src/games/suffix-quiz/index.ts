import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuffixQuizState, SuffixQuizAction, SuffixQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuffixQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const suffixQuizPlugin: GamePlugin<SuffixQuizState, SuffixQuizAction, typeof settings> = {
  id: "suffix-quiz", title: "Suffix Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the suffix and what it means in English vocabulary.",
  howToPlay: `Suffix Quiz tests your knowledge of English suffixes — letters added to the end of a word to change its function or meaning. Each question targets a common suffix's role, or which suffix creates a particular kind of word.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Suffixes turn nouns into adjectives ('-ful'), adjectives into adverbs ('-ly'), and verbs into agents ('-er'). Mastering suffixes unlocks word formation patterns that boost vocabulary. Build skills, score points, and dominate the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuffixQuizSettings),
  reducer, isTerminal, 
  hint: (state: SuffixQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: SuffixQuizGame,
};
