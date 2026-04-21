import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RouletteState, RouletteAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Roulette } from "./Roulette.js";

export const rouletteSettings = {
  maxSpins: {
    kind: "enum" as const,
    label: "Max Spins",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
} as const;

type RouletteSettingsType = SettingsOf<typeof rouletteSettings>;

export const roulettePlugin: GamePlugin<RouletteState, RouletteAction, typeof rouletteSettings> = {
  id: "roulette",
  title: "Roulette",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place your bets, spin the wheel. Red or black? Odd or even? A single number for 35:1?",
  howToPlay: `American Roulette has a wheel with 38 slots: 0 (green), 00 (green), and 1–36 (alternating red and black).

Each spin, place one or more bets, then hit Spin. The ball lands on a random slot and your bets are settled.

Outside bets (lower risk, lower reward): Red/Black, Odd/Even, Low (1–18) or High (19–36) all pay 1:1. First, Second, or Third 12 (dozens) pay 2:1. Columns pay 2:1.

Inside bets (higher risk, higher reward): A Straight bet on any single number pays 35:1. Note that 0 and 00 are green — they lose all outside bets.

Multiple bets per spin: you can add several bets before spinning, covering different outcomes at once.

Strategy: Outside bets are closest to even-money, but the house edge (5.26% in American Roulette) applies to all bets equally. The Straight bet offers the biggest thrill — and the biggest long-run house edge per spin.

Settings: Choose how many spins per session (10, 25, or 50). Score equals your final bankroll. Start with $1,000.`,
  settings: rouletteSettings,
  initialState: (seed: number, settings: RouletteSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Roulette,
};
