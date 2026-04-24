import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnteUpState, AnteUpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnteUpBlackjackGame } from "./Game.js";

export const anteUpSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 50,
    step: 5,
    default: 20,
  },
  mainBet: {
    kind: "enum" as const,
    label: "Main Bet",
    options: ["10", "25", "50"] as const,
    default: "10",
  },
} as const;

type Settings = SettingsOf<typeof anteUpSettings>;

export const anteUpBlackjackPlugin: GamePlugin<AnteUpState, AnteUpAction, typeof anteUpSettings> = {
  id: "ante-up-blackjack",
  title: "Ante Up Blackjack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard Blackjack with a mandatory ante side bet. Hit 21 for bonus payouts on the ante.",
  howToPlay: `Ante Up Blackjack plays like standard Blackjack but adds a compulsory side bet called the Ante. Every deal costs your main bet plus an additional Ante (approximately 20% of the main bet).

Main game: Play proceeds exactly like Blackjack — Hit, Stand, or Double Down. Beat the dealer to 21 without busting. Blackjack pays 3:2 on the main bet. Dealer draws to 17.

Ante side bet: The Ante is a separate wager that pays bonuses only when you reach exactly 21. A Blackjack (two-card 21) pays 2:1 on the Ante. A three-card 21 pays 1:1 on the Ante. Any other hand — even a winning one — loses the Ante.

The Ante creates a fascinating tension: should you stand on 20 (which will lose the Ante), or risk hitting hoping for 21 (which could also bust)? The decision varies from standard Blackjack strategy.

Tips: The Ante bonus is independent of the main bet — you can win the main bet and lose the Ante (finished on 18 vs dealer 16), or lose the main bet but win the Ante bonus (if you hit 21 but dealer also hit 21). Track both bets separately in your thinking.`,
  settings: anteUpSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: AnteUpBlackjackGame,
};
