import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedDogState, RedDogAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedDog } from "./Game.js";

export const redDogSettings = {
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

type RedDogSettingsType = SettingsOf<typeof redDogSettings>;

export const redDogPlugin: GamePlugin<RedDogState, RedDogAction, typeof redDogSettings> = {
  id: "red-dog",
  title: "Red Dog",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet whether the third card falls between the first two. Wide spreads pay less; tight spreads pay more.",
  howToPlay: `Red Dog is a simple card game where you bet on whether a third card will fall between two dealt cards.

Each round, two cards are dealt face-up. The spread is the number of card values strictly between them — for example, a 5 and a Jack gives a spread of 5 (6, 7, 8, 9, 10).

Special cases: If the two cards are consecutive (e.g., 7 and 8), the hand is an automatic push — your ante is returned. If the two cards have the same rank (a pair), a third card is dealt immediately: if it matches, you win 11:1; otherwise it's a push.

For all other hands, you see the spread and decide: Stay (keep your original bet) or Raise (double your bet). Then the third card is revealed.

If the third card's rank falls strictly between the first two cards, you win based on the spread:
• Spread 1: 5:1  • Spread 2: 4:1  • Spread 3: 2:1  • Spread 4+: 1:1

If the third card doesn't fall between the first two, you lose your bet(s).

Strategy tip: Raise when the spread is large (7 or more) since the odds favor you. With a small spread (1–3), the house has an edge — consider staying.

Settings: Choose starting bankroll and ante size. Play continues as long as you have chips.`,
  settings: redDogSettings,
  initialState: (seed: number, settings: RedDogSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RedDog,
};
