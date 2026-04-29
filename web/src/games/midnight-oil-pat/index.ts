import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const midnightOilPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "midnight-oil-pat",
  title: "Midnight Oil",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "La Belle Lucie variant with flexible fans; suit-cluster scoring.",
  howToPlay: "Midnight Oil is a La Belle Lucie variant with flexible fan sizes — here adapted as a ten-round seeded hand variant where same-suit clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest same-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Midnight Oil patience earned its name from the long sessions players burned trying to solve it — La Belle Lucie's notorious near-impossibility distilled. This micro-variant honors the long-night effort by rewarding suit perfection. Burn your oil, swap to seal a suit, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
