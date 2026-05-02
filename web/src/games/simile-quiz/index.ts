import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SimileQuizState, SimileQuizAction, SimileQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SimileQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const simileQuizPlugin: GamePlugin<SimileQuizState, SimileQuizAction, typeof settings> = {
  id: "simile-quiz", title: "Simile Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Complete or interpret common English similes using 'like' or 'as'.",
  howToPlay: `Simile Quiz tests your knowledge of common English similes — comparisons using 'like' or 'as'. Each question asks you to complete a familiar simile or pick the simile from a set of phrases.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Similes spice up writing: 'as brave as a lion', 'sleeps like a log', 'busy as a bee'. They are easier to spot than metaphors because of those telltale 'like' or 'as'. Whether for school, writing, or wordplay love, Simile Quiz keeps you sharp. Score points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SimileQuizSettings),
  reducer, isTerminal, 
  hint: (state: SimileQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: SimileQuizGame,
};
