import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const duchessPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "duchess-pat",
  title: "Duchess",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact patience with three reserve fans; high-card bonus.",
  howToPlay: "Duchess is a compact patience with three reserve fans and a flexible foundation seeding rule, here adapted as a ten-round seeded hand variant where high-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of high cards (J, Q, K, A) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card without ending the round.\n\nScores compound over ten rounds. Typical totals land between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Duchess game allows the player to choose which of the four reserve fans seeds the first foundation — a small but tactical decision that earned its court-style name. This micro-variant rewards pulling royals together. Court your court cards, swap toward the crown, and aim for an Excellent run.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
