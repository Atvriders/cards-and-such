import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TexasHoldemState, TexasHoldemAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TexasHoldem } from "./TexasHoldem.js";

export const texasHoldemSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  blinds: {
    kind: "enum" as const,
    label: "Blind Levels",
    options: ["2/4", "5/10", "10/20"] as const,
    default: "5/10",
  },
} as const;

type TexasHoldemSettingsType = SettingsOf<typeof texasHoldemSettings>;

export const texasHoldemPlugin: GamePlugin<TexasHoldemState, TexasHoldemAction, typeof texasHoldemSettings> = {
  id: "texas-holdem",
  title: "Texas Hold'em",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Texas Hold'em vs a bot. 2 hole cards + 5 community cards. Best hand wins.",
  howToPlay: `Texas Hold'em is the world's most popular poker variant. You play heads-up against a bot with the goal of winning all the chips.

Each hand begins with blinds — forced bets that seed the pot. You and the bot alternate who posts the small and big blind each hand. You each receive 2 private hole cards, then 5 community cards are revealed in three rounds: the Flop (3 cards), the Turn (1 card), and the River (1 card). The best 5-card hand made from any combination of your 2 hole cards and the 5 community cards wins the pot.

Betting is fixed-limit: pre-flop and flop bets are 1× the big blind; turn and river bets are 2×. On each street you can: Check (bet nothing), Bet/Raise (add a fixed amount), Call (match the opponent's bet), or Fold (surrender the pot).

Hand rankings from best to worst: Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.

The bot uses hand strength and pot odds to decide actions — it will bluff occasionally and fold weak hands. The game ends when one player runs out of chips.

Settings: Starting Bankroll ($500/$1000/$5000), Blind Levels (2/4, 5/10, 10/20). Final score equals your chip count.`,
  settings: texasHoldemSettings,
  initialState: (seed: number, settings: TexasHoldemSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TexasHoldem,
};
