import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeCardPokerState, ThreeCardPokerAction } from "./state.js";
import { initialState, reducer, isTerminal, rankThreeHand } from "./state.js";
import { ThreeCardPoker } from "./Game.js";

export const threeCardPokerSettings = {
  startingBankroll: {
    kind: "number" as const,
    label: "Starting Bankroll",
    min: 100,
    max: 5000,
    step: 100,
    default: 1000,
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante / Pair Plus Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
  bets: {
    kind: "enum" as const,
    label: "Active Bets",
    options: ["ante", "pair-plus", "both"] as const,
    default: "both",
  },
} as const;

type ThreeCardSettingsType = SettingsOf<typeof threeCardPokerSettings>;

export const threeCardPokerPlugin: GamePlugin<ThreeCardPokerState, ThreeCardPokerAction, typeof threeCardPokerSettings> = {
  id: "three-card-poker",
  title: "Three Card Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three cards each. Ante + Play vs dealer, and optional Pair Plus side bet.",
  howToPlay: `Three Card Poker is a fast-paced casino game using just three cards per hand.

Bets: You can play the Ante (vs dealer), Pair Plus (side bet on your hand strength), or both. Place your bet(s) before each deal.

Ante vs Dealer: After seeing your 3 cards, choose to Fold (lose your ante) or Play (match the ante). The dealer qualifies only with Queen-high or better. If the dealer doesn't qualify, your ante pays 1:1 and your play bet is returned — even if you have a weak hand! If the dealer qualifies, the higher hand wins even money on both ante and play.

Ante bonus for premium hands (paid even on dealer non-qualify):
Straight Flush: 5:1 on ante. Three of a Kind: 4:1. Straight: 1:1.

Pair Plus (independent of dealer): Pays based purely on your hand:
Straight Flush: 40:1 | Three of a Kind: 30:1 | Straight: 6:1 | Flush: 3:1 | Pair: 1:1.

Three-card hand rankings (from best): Straight Flush, Three of a Kind, Straight, Flush, Pair, High Card. Note that in three-card poker, three of a kind beats a straight.

Strategy: Always play (don't fold) with Queen-6-4 or better.

Settings: Set starting bankroll, bet size, and which bets to place.`,
  settings: threeCardPokerSettings,
  initialState: (seed: number, settings: ThreeCardSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: ThreeCardPokerState): HintTarget | null => {
    if (state.phase === "betting" || state.phase === "settled") {
      if (state.bankroll <= 0) return null;
      return { selector: '[data-testid="hint-target-three-card-poker-deal"]', pulses: 3 };
    }
    if (state.phase !== "decision" || state.playerCards.length !== 3) return null;
    // House strategy: play with Q-6-4 or better.
    const r = rankThreeHand(state.playerCards);
    if (r.class !== "high-card") {
      return { selector: '[data-testid="hint-target-three-card-poker-play"]', pulses: 3 };
    }
    const ranks = state.playerCards.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
    const [a, b, c] = ranks;
    if (a! > 12 || (a === 12 && (b! > 6 || (b === 6 && c! >= 4)))) {
      return { selector: '[data-testid="hint-target-three-card-poker-play"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-three-card-poker-fold"]', pulses: 3 };
  },
  component: ThreeCardPoker,
};
