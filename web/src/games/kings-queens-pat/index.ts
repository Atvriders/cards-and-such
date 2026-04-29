import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const kingsQueensPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "kings-queens-pat",
  title: "Kings and Queens",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Court-pair patience; high-card bonus.",
  howToPlay: "Kings and Queens is a patience that builds court-pair foundations (eight foundations on K-Q couples) — here adapted as a ten-round seeded hand variant where high-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of high cards (J, Q, K, A) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound across ten rounds. Typical results land between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Kings and Queens layout is famously thematic, ending in eight royal couples. This micro-variant captures the spirit by rewarding royal-rich hands. Honour the courts, swap toward majesty, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
