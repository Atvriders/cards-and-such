import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapoleonState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonCard } from "./NapoleonCard.js";

const napoleonSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type NapoleonSettingsType = SettingsOf<typeof napoleonSettings>;

type NapoleonAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const napoleonCardPlugin: GamePlugin<NapoleonState, NapoleonAction, typeof napoleonSettings> = {
  id: "napoleon-card",
  title: "Napoleon (Nap)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid how many tricks you'll take (2–5) and declare trump by your best suit.",
  howToPlay: `Napoleon, or Nap, is a classic British trick-taking card game played with a standard 52-card deck. Each player is dealt 5 cards.

The Auction: Starting with the player to the dealer's left, each player either passes or bids a number from 2 to 5 — the number of tricks they claim they can win. The highest bidder becomes Napoleon (the declarer) and chooses trump based on their best suit. A bid of 5 is called "Nap" — a declaration to win all five tricks.

Play: Napoleon leads first. Players must follow the led suit if possible. If unable, they may play any card including trump. The highest trump wins; if no trump, the highest card of the led suit wins. Napoleon tries to make their bid; the other three players (defenders) cooperate to set Napoleon.

Scoring: Making the bid scores +bid points. Being set costs −bid points. A successful Nap (bid of 5) scores +10.

Strategy: Bid conservatively unless you hold strong trumps and high side-suit cards. As a defender, keep trump to counter Napoleon's lead.

Click a bid button or Pass, then click cards to play.`,
  settings: napoleonSettings,
  initialState: (seed: number, settings: NapoleonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: NapoleonCard,
};
