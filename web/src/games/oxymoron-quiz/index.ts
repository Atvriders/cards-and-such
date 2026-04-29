import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OxymoronQuizState, OxymoronQuizAction, OxymoronQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OxymoronQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const oxymoronQuizPlugin: GamePlugin<OxymoronQuizState, OxymoronQuizAction, typeof settings> = {
  id: "oxymoron-quiz", title: "Oxymoron Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify oxymorons — paired contradictory words used as a phrase.",
  howToPlay: `Oxymoron Quiz tests your ear for oxymorons — phrases combining apparently contradictory terms ('jumbo shrimp', 'deafening silence', 'bittersweet'). Each question asks which option is a true oxymoron.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Oxymorons capture life's contradictions — they sharpen poetry, prose, and humor. 'Original copy', 'open secret', 'awfully good': each holds a wink. Whether you love wordplay or just want to spot literary devices, Oxymoron Quiz keeps you guessing. Score points and laugh at language!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OxymoronQuizSettings),
  reducer, isTerminal, component: OxymoronQuizGame,
};
