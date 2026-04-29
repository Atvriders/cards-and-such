import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fourteenOutPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "fourteen-out-pat",
  title: "Fourteen Out",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pair-removal patience summing to fourteen; pair scoring.",
  howToPlay: "Fourteen Out is a pair-removal patience that clears combinations summing to fourteen from a row of overlapping cards — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nFourteen Out is the four-handed cousin of Pyramid's pair-to-thirteen rule: you remove cards that pair to fourteen rather than thirteen. This micro-variant rewards rank-doubling rather than sum-matching, but in similar spirit. Pair up, swap toward fourteen, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
