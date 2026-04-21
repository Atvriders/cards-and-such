import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GinRummyState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GinRummy } from "./GinRummy.js";

export const ginRummySettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type GinRummySettingsType = SettingsOf<typeof ginRummySettings>;

type GinRummyAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "knock" };

export const ginRummyPlugin: GamePlugin<GinRummyState, GinRummyAction, typeof ginRummySettings> = {
  id: "gin-rummy",
  title: "Gin Rummy",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Form sets and runs. Knock when your deadwood is low — but beware the undercut.",
  howToPlay: `Gin Rummy is a 2-player card game where you race to form melds and minimize unmelded "deadwood" cards.

Setup: Each player receives 10 cards. One card is flipped face-up to start the discard pile; the remaining 31 cards form the stock.

On your turn: First draw one card — either the top card of the stock (face down) or the top card of the discard pile. Then discard one card face-up onto the discard pile.

Melds: Sets are 3 or 4 cards of the same rank. Runs are 3 or more consecutive ranks of the same suit (Ace is low). Cards in melds are worth 0 deadwood; unmelded cards count their face value (face cards = 10, Ace = 1).

Knocking: When your deadwood total is 10 or less, you may knock instead of just discarding. Click "Knock" before discarding. The opponent then lays off their deadwood cards onto your melds if possible.

Scoring: If you knock with 0 deadwood (Gin), you earn 25 bonus points plus the opponent's remaining deadwood. If you knock normally and your deadwood is lower, you win the difference. If the opponent's deadwood after lay-off is equal or lower (undercut), they win 25 points plus the difference.

Controls: Click the stock or discard to draw. Click a card in your hand to discard it. Click "Knock" to end the hand when eligible.`,
  settings: ginRummySettings,
  initialState: (seed: number, settings: GinRummySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: GinRummy,
};
