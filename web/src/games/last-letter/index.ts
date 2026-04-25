import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LastLetterState, LastLetterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LastLetter } from "./Game.js";

export const lastLetterSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["60", "90", "120"] as const,
    default: "60" as const,
  },
} as const;

type LastLetterSettingsType = SettingsOf<typeof lastLetterSettings>;

export const lastLetterPlugin: GamePlugin<LastLetterState, LastLetterAction, typeof lastLetterSettings> = {
  id: "last-letter",
  title: "Last Letter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chain words together — each new word must start with the last letter of the previous one!",
  howToPlay: `Last Letter is a fast-paced word chaining game. You start with a random seed word, and your job is to build the longest chain possible before the timer runs out.

The rule is simple: each word you enter must begin with the last letter of the previous word. For example: ocean → naïve → every → year → …

Words must be at least 3 letters long and must come from the game's built-in dictionary of common English words. You cannot reuse a word already in the chain.

Type your next word in the text box and press Enter or click Add to submit. If your word is valid and follows the chain rule, it is added and you score points equal to its length. Longer words earn more.

The game ends when the timer runs out. Choose 60, 90, or 120 seconds in settings.

Tips: think ahead — try to end each word on a common starting letter like S, T, A, R, or E so you have plenty of options for the next word. Avoid ending on rare letters like X, Q, or Z unless you already have a follow-up in mind. Shorter words are easier to validate but score fewer points.`,
  settings: lastLetterSettings,
  initialState: (seed: number, settings: LastLetterSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LastLetter,
};
