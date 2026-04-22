import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenCardStudState, StudAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenCardStud } from "./SevenCardStud.js";

export const sevenCardStudSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type SevenCardStudSettingsType = SettingsOf<typeof sevenCardStudSettings>;

export const sevenCardStudPlugin: GamePlugin<SevenCardStudState, StudAction, typeof sevenCardStudSettings> = {
  id: "seven-card-stud",
  title: "7-Card Stud",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 7-Card Stud vs a bot. No community cards — 7 cards dealt per player across 5 streets.",
  howToPlay: `7-Card Stud is a classic poker game with no community cards. Each player receives up to 7 personal cards and must make the best 5-card hand.

Each hand starts with both players posting an ante. On 3rd Street, each player receives 2 cards face-down (hole cards) and 1 card face-up. The player with the lowest face-up card acts first (brings in). Then betting proceeds.

On 4th, 5th, and 6th Streets, one more card is dealt face-up to each player with a betting round after each. On 7th Street (the final card), one card is dealt face-down. After the last betting round, remaining players reveal their hands — the best 5-card hand from their 7 cards wins the pot.

Betting is fixed-limit: streets 3 and 4 use the small bet (1× ante), streets 5, 6, and 7 use the big bet (2× ante). On each betting round you can: Check (if no bet yet), Bet, Call, Raise, or Fold.

You can see your opponent's face-up cards — use this information to gauge their hand strength. The bot evaluates hand strength progressively as cards are revealed.

The game continues until one player runs out of chips. Settings: Starting Bankroll ($500/$1000/$5000), Ante Size ($5/$10/$25).`,
  settings: sevenCardStudSettings,
  initialState: (seed: number, settings: SevenCardStudSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SevenCardStud,
};
