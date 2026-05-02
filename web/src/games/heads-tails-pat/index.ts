import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const headsTailsPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "heads-tails-pat",
  title: "Heads and Tails",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Alternating-direction foundations patience; pair scoring.",
  howToPlay: "Heads and Tails is an alternating-direction foundation patience where four foundations build up while four others build down — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nTotals compound across ten rounds. Typical results fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nHeads and Tails is named for the two-direction foundation idea — every card can go to a Head or a Tail pile. This micro-variant rewards capturing rank pairs to mimic the cross-foundation harvest. Pair up, swap toward a doubling, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SoliGame,
};
