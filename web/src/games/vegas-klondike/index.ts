import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const vegasKlondikePlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "vegas-klondike",
  title: "Vegas Klondike",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with one stock pass and Vegas-style cumulative scoring.",
  howToPlay: "Vegas Klondike applies Las Vegas casino-style scoring (one stock pass, fifty-two-dollar buy-in, five dollars per founded card) to a familiar Klondike layout — adapted here as a ten-round seeded hand variant where suit clusters drive the payout. Each round you receive a fresh five-card hand from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest single-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound across ten rounds. Expect forty to one hundred ten; ratings are Pass, Fair, Good, Excellent. The deal is fully seeded for replay.\n\nIn the casino version, each card founded pays five dollars and the deal costs fifty-two — a positive-EV win is a foundation-clearing slam. This adaptation rewards clean suit work in similar spirit. Bet big, swap smart, and aim for an Excellent rating to crown your trip to digital Vegas.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
