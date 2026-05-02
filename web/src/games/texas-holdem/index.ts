import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TexasHoldemState, TexasHoldemAction } from "./state.js";
import { initialState, reducer, isTerminal, bestFiveOf } from "./state.js";
import { rankHand, type HandClass } from "../../engines/deck/ranking.js";
import { TexasHoldem } from "./TexasHoldem.js";

const HOLDEM_CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

function holdemHint(state: TexasHoldemState): HintTarget | null {
  if (state.phase === "waiting" || state.phase === "showdown") {
    if (state.bankroll <= 0 || state.botBankroll <= 0) return null;
    return { selector: '[data-testid="hint-target-texas-holdem-deal"]', pulses: 3 };
  }
  if (!state.playerTurn) return null;
  const toCall = state.botBet - state.playerBet;
  // Compute hand strength using available cards.
  const allCards = [...state.playerHole, ...state.community];
  let strength = -1;
  if (allCards.length >= 5) {
    const five = bestFiveOf(allCards);
    strength = HOLDEM_CLASS_ORDER.indexOf(rankHand(five).class);
  } else if (state.playerHole.length === 2) {
    // Pre-flop heuristic: pair, suited, or both > 10 = decent.
    const [a, b] = state.playerHole;
    const ra = a!.rank === 1 ? 14 : a!.rank;
    const rb = b!.rank === 1 ? 14 : b!.rank;
    const isPair = ra === rb;
    const isSuited = a!.suit === b!.suit;
    const high = Math.max(ra, rb);
    if (isPair && ra >= 10) strength = 4;
    else if (isPair) strength = 2;
    else if (isSuited && high >= 12) strength = 2;
    else if (high >= 12) strength = 1;
    else strength = 0;
  }
  if (toCall === 0) {
    return { selector: '[data-testid="hint-target-texas-holdem-check"]', pulses: 3 };
  }
  // Pot odds.
  const equity = strength >= 0 ? (strength + 1) / 9 : 0.15;
  const odds = toCall / (state.pot + toCall);
  if (equity > odds) {
    return { selector: '[data-testid="hint-target-texas-holdem-call"]', pulses: 3 };
  }
  return { selector: '[data-testid="hint-target-texas-holdem-fold"]', pulses: 3 };
}

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
  hint: holdemHint,
  component: TexasHoldem,
  themeOverrides: {
    // Real poker-room green felt — overrides the user's chosen ThemePicker
    // theme just for this game so cards/chips read against a classic table.
    feltGradient: "linear-gradient(135deg, #0b3d2e, #1a6c3f)",
    accent: "rgba(74, 222, 128, 0.50)",
  },
};
