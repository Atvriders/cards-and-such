import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBidFlipState, CardBidFlipAction, CardBidFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardBidFlip = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardBidFlip as unknown as React.ComponentType<unknown> })));
const cardBidFlipSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type CardBidFlipSettingsType = SettingsOf<typeof cardBidFlipSettings>;

export const cardBidFlipPlugin: GamePlugin<CardBidFlipState, CardBidFlipAction, typeof cardBidFlipSettings> = {
  id: "card-bid-flip",
  title: "Card Bid Flip",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet your coins, flip a card, and win big if it lands on 8 or higher. Grow your bankroll before you go bust!",
  howToPlay: `Card Bid Flip is a quick betting card game. You start with 100 coins and must decide how much to wager each round before the card is revealed.

The rule is simple: cards ranked 8 through Ace (about half the deck) are winners. Cards ranked 2 through 7 are losers. If the flipped card ranks 8 or higher, you win your bid; if it ranks 7 or lower, you lose it.

Enter your bid amount in the input box and press Flip. The card is revealed instantly. A green message means you won; red means you lost. Press Next to go to the next round.

Bet conservatively to stay alive longer, or go big to rack up coins fast. If your coins hit zero the game ends early. The game also ends after the chosen number of rounds.

Your final coin total is your score. Use Settings to play 10 or 20 rounds. Can you triple your starting coins or will you go bust before the final flip?`,
  settings: cardBidFlipSettings,
  initialState: (seed: number, settings: CardBidFlipSettingsType) => initialState(seed, settings as CardBidFlipSettings),
  reducer,
  isTerminal,
  hint: (state: CardBidFlipState): HintTarget | null => (state.phase === "bidding" ? { selector: '[data-testid="hint-target-card-bid-flip-primary"]', pulses: 3 } : null),
  component: CardBidFlip,
};
