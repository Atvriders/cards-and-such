import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleBonusState, DoubleBonusAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleBonusPoker } from "./Game.js";

export const doubleBonusSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5, max: 100, step: 5, default: 25,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type DoubleBonusSettingsType = SettingsOf<typeof doubleBonusSettings>;

export const doubleBonusPokerPlugin: GamePlugin<DoubleBonusState, DoubleBonusAction, typeof doubleBonusSettings> = {
  id: "double-bonus-poker",
  title: "Double Bonus Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video poker with boosted four-of-a-kind payouts. Aces pay 160x!",
  howToPlay: `Double Bonus Poker is a Jacks-or-Better variant with dramatically enhanced four-of-a-kind payouts — especially for Aces.

Deal: You receive 5 cards. Click cards to hold them, then hit Draw to replace the rest.

Pay table highlights: Royal Flush 800x, Straight Flush 50x, Four Aces 160x, Four 2s-4s 80x, Four 5s-Ks 50x, Full House 10x, Flush 7x, Straight 5x, Three of a Kind 3x, Two Pair 1x, Jacks or Better (pair of J/Q/K/A) 1x.

Strategy: The boosted four-of-a-kind payouts change optimal play significantly. Break up full houses to chase four aces or four 2s-4s. Keep three aces over a full house. Hold three of any kind when you could draw for quads.

Two pair still pays 1:1 — hold it. Jacks-or-better pair is the minimum paying hand; lower pairs are discarded unless they connect toward straights or flushes.

Score equals your final bankroll at session end.`,
  settings: doubleBonusSettings,
  initialState: (seed: number, settings: DoubleBonusSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "betting" || state.phase === "settled") return { selector: '[data-testid="hint-target-double-bonus-poker-deal"]', pulses: 3 };
      if (state.phase === "draw") return { selector: '[data-testid="hint-target-double-bonus-poker-draw"]', pulses: 3 };
      return null;
    },
  component: DoubleBonusPoker,
};
