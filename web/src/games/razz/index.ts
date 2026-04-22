import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RazzState, RazzAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Razz } from "./Razz.js";

export const razzSettings = {
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

type RazzSettingsType = SettingsOf<typeof razzSettings>;

export const razzPlugin: GamePlugin<RazzState, RazzAction, typeof razzSettings> = {
  id: "razz",
  title: "Razz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "7-Card Stud Low — the LOWEST hand wins. Aces low, straights/flushes don't count.",
  howToPlay: `Razz is 7-Card Stud played for low — the goal is to make the WORST standard poker hand. Aces are always low (value 1), and straights and flushes don't count against you.

The perfect Razz hand is A-2-3-4-5 (called the "wheel"), and the worst is K-Q-J-10-9.

Each hand starts with both players posting an ante. On 3rd Street, each player gets 2 cards face-down and 1 face-up. In Razz, the player with the HIGHEST face-up card acts first (unlike regular stud where the lowest brings in). This makes sense — you want to be stuck acting first if your upcard is bad!

Streets proceed just like 7-Card Stud: 4th, 5th, and 6th Streets deal one face-up card each with a betting round. 7th Street deals one final face-down card. After all betting, the best low hand (best 5 of 7 cards) wins.

Fixed-limit betting: streets 3-4 use the small bet (1× ante), streets 5-7 use the big bet (2× ante). Actions: Check, Bet, Call, Raise, or Fold.

Watch your opponent's face-up cards — if they're showing high cards, they're in trouble! Low face-up cards signal a strong Razz hand.

Settings: Starting Bankroll ($500/$1000/$5000), Ante Size ($5/$10/$25).`,
  settings: razzSettings,
  initialState: (seed: number, settings: RazzSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Razz,
};
