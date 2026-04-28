import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BidWhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BidWhist } from "./BidWhist.js";

const bidWhistSettings = {} as const;
type BidWhistSettings = SettingsOf<typeof bidWhistSettings>;
type BidWhistAction = { type: "play"; cardId: string };

export const bidWhistPlugin: GamePlugin<BidWhistState, BidWhistAction, typeof bidWhistSettings> = {
  id: "bid-whist",
  title: "Bid Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partnership Whist with bidding for trump — trimmed to a duel.",
  howToPlay: `Bid Whist is a Whist variant popular in the United States, where teams bid for the right to choose trump. In this simplified one-on-one version, hearts are fixed as trump (a common Bid Whist trump in casual play). You and the bot each receive 13 cards from a 52-card deck. Each round, follow the led suit if you can; otherwise play any card, including trump. The highest trump wins; otherwise the highest card of the led suit wins. Click cards to play. The trick winner leads the next. Strategy: count trumps carefully, lead long side suits to flush out the bot’s hearts, then run your remaining trumps. Score equals tricks taken; win by capturing seven or more of the 13 tricks. The seed determines the shuffle, so a given seed always deals the same starting hand.`,
  settings: bidWhistSettings,
  initialState: (seed: number, _settings: BidWhistSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: BidWhist,
};
