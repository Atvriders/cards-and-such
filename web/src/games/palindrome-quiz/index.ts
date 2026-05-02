import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PalindromeQuizState, PalindromeQuizAction, PalindromeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PalindromeQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const palindromeQuizPlugin: GamePlugin<PalindromeQuizState, PalindromeQuizAction, typeof settings> = {
  id: "palindrome-quiz", title: "Palindrome Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify true palindromes — words/phrases that read the same forward and backward.",
  howToPlay: `Palindrome Quiz challenges you to identify true palindromes — words or phrases that read the same forwards and backwards. Each question presents four candidates; only one is genuinely palindromic.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Palindromes are tiny linguistic wonders — 'racecar', 'level', 'kayak', 'A man, a plan, a canal: Panama!'. Spotting them sharpens your spelling and trains pattern-recognition skills. Whether you love wordplay or you are just here for fun, Palindrome Quiz delivers brain-tickling delight. Score points, find palindromes!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PalindromeQuizSettings),
  reducer, isTerminal, 
  hint: (state: PalindromeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PalindromeQuizGame,
};
