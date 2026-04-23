import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GermanWhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GermanWhist } from "./GermanWhist.js";

export const germanWhistSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type GermanWhistSettingsType = SettingsOf<typeof germanWhistSettings>;
type GermanWhistAction = { type: "play"; cardId: string };

export const germanWhistPlugin: GamePlugin<GermanWhistState, GermanWhistAction, typeof germanWhistSettings> = {
  id: "german-whist",
  title: "German Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "2-player trick-taking. Build your hand in phase 1, then play it out in phase 2.",
  howToPlay: `German Whist is a two-player trick-taking game using a standard 52-card deck.

Setup: Each player receives 13 cards. The remaining 26 cards form a face-down stock with the top card turned face-up. That top card's suit is the trump suit for the entire game.

Phase 1 — Building hands (13 tricks): You and the bot alternate leading tricks. The winner of each trick takes the face-up stock card (a desirable pick); the loser takes the next hidden card. A new card is flipped face-up for the next trick. This continues until the stock is exhausted.

Following suit: You must play a card of the led suit if you have one. If you cannot follow suit you may play any card. Trump beats all non-trump cards of any rank.

Phase 2 — Playing out (13 tricks): With the stock gone, play out your 13-card hands. Normal trick-taking rules apply — follow suit if possible, trump if desired. The winner of each trick leads the next.

Scoring: The player who wins more tricks in Phase 2 wins. Most tricks = win (score 100); fewer tricks = loss (score 0); equal = tie (score 50).

Strategy: In Phase 1 think carefully — sometimes losing a trick to take a good hidden card is worthwhile. Build toward controlling Phase 2.`,
  settings: germanWhistSettings,
  initialState: (seed: number, settings: GermanWhistSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: GermanWhist,
};
