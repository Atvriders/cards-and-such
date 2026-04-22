import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PinochleState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Pinochle } from "./Pinochle.js";

export const pinochleSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot Difficulty",
    options: ["easy", "standard"] as const,
    default: "standard" as const,
  },
} as const;

type PinochleSettingsType = SettingsOf<typeof pinochleSettings>;
type PinochleAction = { type: "play"; cardId: string };

export const pinochlePlugin: GamePlugin<PinochleState, PinochleAction, typeof pinochleSettings> = {
  id: "pinochle",
  title: "Pinochle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-player partnership trick-taking with a 48-card double deck and meld scoring.",
  howToPlay: `Pinochle is a partnership trick-taking game using a special 48-card deck — two copies each of 9, J, Q, K, 10, A in all four suits (96 cards split into 4 hands of 12).

Trump: Trump is automatically declared for the bot with the longest suit. Your team is You + Bot 2; opponents are Bot 1 + Bot 3.

Melds: Before play begins, melds are automatically counted from each player's hand. Valuable combinations include: Run (A-K-Q-J-10 of trump) = 150, Four Aces = 100, Four Kings = 80, Four Queens = 60, Four Jacks = 40, Pinochle (Q♠+J♦) = 40, Trump Marriage (K+Q of trump) = 40, Other Marriage = 20.

Playing tricks: Must follow the led suit if possible; if not, must play trump if possible; otherwise play any card. Trick rank order (low to high): 9, J, Q, K, 10, A. Trump beats non-trump; highest trump wins otherwise.

Counter scoring: Each team's taken trick-cards are scored: Ace=11, 10=10, King=4, Queen=3, Jack=2, 9=0. Total maximum counters = 120.

Final score: counters + meld points for each team. Higher total wins.

Controls: Click highlighted cards to play. Dimmed cards are illegal.`,
  settings: pinochleSettings,
  initialState: (seed: number, settings: PinochleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Pinochle,
};
