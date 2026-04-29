import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HyperboleQuizState, HyperboleQuizAction, HyperboleQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HyperboleQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hyperboleQuizPlugin: GamePlugin<HyperboleQuizState, HyperboleQuizAction, typeof settings> = {
  id: "hyperbole-quiz", title: "Hyperbole Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify hyperboles — exaggerations used for emphasis or effect.",
  howToPlay: `Hyperbole Quiz tests your ear for hyperbole — deliberate, obvious exaggeration used for emphasis or comic effect. Each question asks you to identify which option is a hyperbole or what a hyperbole means.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Hyperbole brings color to language — 'I'm so hungry I could eat a horse', 'It took forever', 'She's a million miles ahead'. Used carefully, it adds drama and humor. Whether studying English, writing, or just enjoying language, Hyperbole Quiz keeps your eye sharp. Score points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HyperboleQuizSettings),
  reducer, isTerminal, component: HyperboleQuizGame,
};
