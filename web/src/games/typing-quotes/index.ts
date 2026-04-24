import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TypingQuotesState, TypingQuotesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TypingQuotes } from "./TypingQuotes.js";

export const typingQuotesSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type TypingQuotesSettingsType = SettingsOf<typeof typingQuotesSettings>;

export const typingQuotesPlugin: GamePlugin<TypingQuotesState, TypingQuotesAction, typeof typingQuotesSettings> = {
  id: "typing-quotes",
  title: "Typing Quotes",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Type a famous quote as fast and accurately as possible. Score = WPM × accuracy, no timer pressure.",
  howToPlay: `A famous quote appears on screen. Type it out character by character as quickly and accurately as you can. There is no time limit — the game ends when you finish the entire quote.

The timer starts the moment you type your first character. Each character you type is highlighted green if correct or red if wrong. You must type in order — you cannot skip ahead.

Your score is based on WPM (words per minute) multiplied by your accuracy. For example, if you finish a quote in 30 seconds at 95% accuracy and the quote contains 10 words, that is 20 WPM × 0.95 = 19. Fixing errors slows you down, so weigh speed against accuracy carefully.

Difficulty affects the length and complexity of the quotes. Easy quotes are short and use simple words. Medium quotes are longer and may contain commas and apostrophes. Hard quotes are the longest and most complex.

Tips: Read two or three words ahead as you type so your fingers can prepare. Typing punctuation like apostrophes and commas trips many people up — slow down slightly for those characters. Do not look at your fingers; keep your gaze on the highlighted text. A smooth, steady pace often beats frantic bursting.`,
  settings: typingQuotesSettings,
  initialState: (seed: number, settings: TypingQuotesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TypingQuotes,
};
