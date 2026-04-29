import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const carltonSoliPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "carlton-soli",
  title: "Carlton",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Diamond-layout patience; suit clusters score.",
  howToPlay: "Carlton is a patience with a striking diamond-shaped tableau and four foundations — here adapted as a ten-round seeded hand variant where same-suit clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on the largest same-suit cluster (three of a suit pays nine, four pays twenty, five pays forty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Carlton layout is among the more decorative patience tableaus, with a diamond shape that frames the four foundations beautifully. This micro-variant honors the visual symmetry by rewarding suit-clean hands. Keep your suits tight, swap toward the pure run, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
