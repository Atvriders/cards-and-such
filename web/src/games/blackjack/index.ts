import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackjackState, BlackjackAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Blackjack } from "./Blackjack.js";

export const blackjackSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 100,
    step: 5,
    default: 25,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["5", "10", "25", "100"] as const,
    default: "10",
  },
  deckCount: {
    kind: "enum" as const,
    label: "Number of Decks",
    options: ["1", "4", "6", "8"] as const,
    default: "6",
  },
  dealerHitsSoft17: {
    kind: "boolean" as const,
    label: "Dealer Hits Soft 17",
    default: false,
  },
} as const;

type BlackjackSettingsType = SettingsOf<typeof blackjackSettings>;

export const blackjackPlugin: GamePlugin<BlackjackState, BlackjackAction, typeof blackjackSettings> = {
  id: "blackjack",
  title: "Blackjack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Beat the dealer to 21. Blackjack pays 3:2. Hit, Stand, Double, or Split.",
  settings: blackjackSettings,
  initialState: (seed: number, settings: BlackjackSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Blackjack,
};
