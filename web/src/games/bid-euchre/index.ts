import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BidEuchreState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BidEuchre } from "./BidEuchre.js";

const bidEuchreSettings = {} as const;
type BidEuchreSettings = SettingsOf<typeof bidEuchreSettings>;
type BidEuchreAction = { type: "play"; cardId: string };

export const bidEuchrePlugin: GamePlugin<BidEuchreState, BidEuchreAction, typeof bidEuchreSettings> = {
  id: "bid-euchre",
  title: "Bid Euchre",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Euchre variant with bidding — simplified for solo play with set trump.",
  howToPlay: `Bid Euchre is a Euchre variant played with a 24-card or larger pack where players bid for trump and tricks. This solo duel uses a streamlined 24-card stripped deck (9, 10, J, Q, K, A in each suit) with spades fixed as trump for simplicity. You and the bot each receive 9 cards (a partial Bid Euchre hand). Each trick: follow the led suit if able. Highest spade wins; otherwise highest of the led suit. Click cards to play. The trick winner leads the next. Strategy: count trumps, lead a long side suit early, then run your remaining spades. Score is tricks taken — win 5 of 9 tricks to claim the duel. Bid Euchre rewards careful trump management; over-committing leaves you trumped from behind.`,
  settings: bidEuchreSettings,
  initialState: (seed: number, _settings: BidEuchreSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: BidEuchre,
};
