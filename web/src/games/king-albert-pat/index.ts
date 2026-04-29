import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const kingAlbertPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "king-albert-pat",
  title: "King Albert (Patience)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nine-column open patience; pair scoring.",
  howToPlay: "King Albert (Patience) is a nine-tableau-column open patience with seven reserve cards — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nKing Albert was named for the Belgian king during World War I; the open layout makes the patience moderately solvable with care. This micro-variant honours the patience's measured pacing by rewarding the cleanest pair-builds. Pair up, swap to lock a triple, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
