import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ProverbQuizState, ProverbQuizAction, ProverbQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ProverbQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const proverbQuizPlugin: GamePlugin<ProverbQuizState, ProverbQuizAction, typeof settings> = {
  id: "proverb-quiz", title: "Proverb Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Complete or interpret well-known English proverbs.",
  howToPlay: `Proverb Quiz tests your knowledge of classic English proverbs — short, memorable sayings that capture cultural wisdom. Some questions ask you to complete a famous proverb; others ask its meaning.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Proverbs pack centuries of wisdom into a sentence: 'A stitch in time saves nine'; 'Don't count your chickens'. They sharpen writing, conversation, and intercultural understanding. Whether learning English or polishing your prose, Proverb Quiz delivers fun and insight in equal measure. Score points, learn wisdom!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ProverbQuizSettings),
  reducer, isTerminal, 
  hint: (state: ProverbQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ProverbQuizGame,
};
