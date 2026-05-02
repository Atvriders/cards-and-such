import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const aboveAndBelowPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "above-and-below-pat",
  title: "Above and Below",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Patience with two foundation rows; runs reward.",
  howToPlay: "Above and Below is a two-deck patience with two parallel foundation rows — one built up by suit and one built down — here adapted as a ten-round seeded hand variant where ascending runs in the hand drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to twice the squared length of the longest ascending run (a three-run pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound over ten rounds. Typical results land between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for fair replay.\n\nThe two-row foundation idea makes Above and Below distinctive among classic patiences — moves can serve either direction. This micro-variant honours the run-building spirit. Keep your runs tight, swap to bridge a gap, and aim for an Excellent run-up.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: ".play-restart-btn", pulses: 3 },
  component: SoliGame,
};
