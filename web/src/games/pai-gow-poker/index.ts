import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaiGowPokerState, PaiGowPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaiGowPoker } from "./Game.js";

export const paiGowPokerSettings = {
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
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
} as const;

type PaiGowSettingsType = SettingsOf<typeof paiGowPokerSettings>;

export const paiGowPokerPlugin: GamePlugin<PaiGowPokerState, PaiGowPokerAction, typeof paiGowPokerSettings> = {
  id: "pai-gow-poker",
  title: "Pai Gow Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Split 7 cards into a 5-card high hand and a 2-card low hand. Beat the dealer on both to win.",
  howToPlay: `Pai Gow Poker is played with a 53-card deck — the standard 52 plus one Joker. The Joker acts as an Ace in this simplified version.

Each round, you and the dealer each receive 7 cards. Your task is to split your 7 cards into two hands: a 5-card "high hand" and a 2-card "low hand." The low hand must rank lower than the high hand.

Comparison: Your high hand is compared to the dealer's high hand, and your low hand to the dealer's low hand. If both your hands beat the dealer's corresponding hands, you win 1:1 minus a 5% commission. If both dealer hands beat yours, you lose your ante. If one hand wins and one loses, it's a push — your ante is returned.

Ties go to the dealer (house edge on tied comparisons).

Splitting tip: You can split your cards manually by selecting exactly 2 cards for the low hand, or press "House Way" to let the game split using standard casino strategy.

The 5-card hand ranks normally: pairs, straights, flushes, full houses, etc. The 2-card hand compares only the highest card (Ace is highest), then the second card.

Settings: Choose your starting bankroll and ante size. Play continues until you run out of chips.`,
  settings: paiGowPokerSettings,
  initialState: (seed: number, settings: PaiGowSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PaiGowPoker,
};
