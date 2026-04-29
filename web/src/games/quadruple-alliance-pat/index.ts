import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quadrupleAlliancePatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "quadruple-alliance-pat",
  title: "Quadruple Alliance",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four-suit foundation game; suit clusters score.",
  howToPlay: "Quadruple Alliance is a four-suit foundation patience that builds each suit upward from a chosen starting rank — here adapted as a ten-round seeded hand variant where same-suit clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest same-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Quadruple Alliance is a foundation-pure patience where each of four suits forms a complete sequence — no tableau distractions. This micro-variant honours the pure-suit goal by rewarding suit perfection. Ally with one suit, swap others away, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
