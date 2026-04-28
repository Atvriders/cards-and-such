import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDeckPinochleState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDeckPinochle } from "./DoubleDeckPinochle.js";

const doubleDeckPinochleSettings = {} as const;
type DoubleDeckPinochleSettings = SettingsOf<typeof doubleDeckPinochleSettings>;
type DoubleDeckPinochleAction = { type: "play"; cardId: string };

export const doubleDeckPinochlePlugin: GamePlugin<DoubleDeckPinochleState, DoubleDeckPinochleAction, typeof doubleDeckPinochleSettings> = {
  id: "double-deck-pinochle",
  title: "Double Deck Pinochle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pinochle with 80 cards — simplified to a head-to-head trick duel.",
  howToPlay: `Double Deck Pinochle uses a special 80-card Pinochle pack — two copies of 9, 10, J, Q, K, A in each suit. This duel simplifies the meld and bidding to a pure trick-taking contest with spades as trump. You and the bot each receive 10 cards. Tricks follow standard rules: follow the led suit if able, otherwise play any card. Highest trump wins; otherwise highest of the led suit. Click cards to play. The trick winner leads next. Strategy: with two of every card in the deck, count high-cards aggressively. Lead long side suits to draw out the bot’s spades, then cash your aces. Score is tricks taken; win at least 6 of the 10 to claim victory. Although melds are central to true Pinochle, this version focuses on the trick-play core.`,
  settings: doubleDeckPinochleSettings,
  initialState: (seed: number, _settings: DoubleDeckPinochleSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: DoubleDeckPinochle,
};
