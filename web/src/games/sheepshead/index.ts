import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SheepsheadState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Sheepshead } from "./Sheepshead.js";

export const sheepsheadSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot Difficulty",
    options: ["easy", "standard"] as const,
    default: "standard" as const,
  },
} as const;

type SheepsheadSettingsType = SettingsOf<typeof sheepsheadSettings>;
type SheepsheadAction = { type: "play"; cardId: string };

export const sheepsheadPlugin: GamePlugin<SheepsheadState, SheepsheadAction, typeof sheepsheadSettings> = {
  id: "sheepshead",
  title: "Sheepshead",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-player trick-taking where you are the solo Picker vs 4 bot defenders.",
  howToPlay: `Sheepshead is a 5-player German-American trick-taking game popular in Wisconsin. You play solo as the "Picker" against 4 bot defenders.

Deck: 32 cards — 7 through Ace in all four suits.

Trump: Clubs is always trump. In addition, all Queens (highest) and Jacks are also trump regardless of their suit. Trump order from high to low: Q♣, Q♠, Q♥, Q♦, J♣, J♠, J♥, J♦, A♣, 10♣, K♣, 9♣, 8♣, 7♣.

The Blind: Two cards are set aside before dealing. You (the Picker) take these and discard your 2 lowest-value cards face down.

Play: 5 players each have 6 cards; 6 tricks are played. You must follow the led suit (counting all trump as one suit) if you can; otherwise play any card. Highest trump wins a trump trick; highest card of led suit wins otherwise.

Scoring: Card point values: Ace=11, 10=10, King=4, Queen=3, Jack=2, others=0 (total 120 points in the deck). You win as Picker if you score 61 or more counter points. The 4 bots cooperate to hold you below 61.

Controls: Click a highlighted card to play it. Your trump cards (clubs, queens, jacks) are your most powerful weapons.`,
  settings: sheepsheadSettings,
  initialState: (seed: number, settings: SheepsheadSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Sheepshead,
};
