import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveHundredState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveHundred } from "./FiveHundred.js";

export const fiveHundredSettings = {
  botBidding: {
    kind: "enum" as const,
    label: "Bot Bidding",
    options: ["conservative", "balanced"] as const,
    default: "balanced" as const,
  },
} as const;

type FiveHundredSettingsType = SettingsOf<typeof fiveHundredSettings>;
type FiveHundredAction =
  | { type: "bid"; bidIndex: number }
  | { type: "play"; cardId: string };

export const fiveHundredPlugin: GamePlugin<FiveHundredState, FiveHundredAction, typeof fiveHundredSettings> = {
  id: "five-hundred",
  title: "500",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partnership trick-taking with bidding on a 32-card deck plus Joker.",
  howToPlay: `500 is a 4-player partnership trick-taking game popular in Australia. You and Bot 2 form one team; Bot 1 and Bot 3 are opponents.

Deck: A 32-card deck (A, K, Q, J, 10 of each suit) plus one Joker — 33 cards total. Each player receives 10 cards; the remaining 3 form the "kitty."

Bidding: Players bid how many tricks (out of 10) their team will win, along with a trump suit. Available bids are 6♥ through 10♥ and 6NT, 8NT, 10NT. Bid Pass to skip. The highest bid wins; that player picks up the kitty and discards 3 cards, then their team tries to fulfill the contract.

Playing: The contract winner leads first. You must follow the led suit if possible; if not, play any card. The Joker beats everything. Trump beats non-trump; highest card of led suit wins otherwise. Winner of each trick leads next.

Scoring: Making the contract scores bid × 20 points for your team. Failing costs bid × 20 points. First team to 500 points wins — this version plays one hand and reports the score.

Controls: During bidding click a bid button or Pass. During play, click a highlighted card to play it.`,
  settings: fiveHundredSettings,
  initialState: (seed: number, settings: FiveHundredSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FiveHundredState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-five-hundred-primary"]', pulses: 3 };
  },
  component: FiveHundred,
};
