import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const doubletsPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "doublets-pat",
  title: "Doublets",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rank-pair removal patience; pair scoring.",
  howToPlay: "Doublets is a fan-pile patience where you remove pairs of identical rank from the top of a single fan — here adapted as a ten-round seeded hand variant where rank-pair clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nDoublets is among the simplest historical patiences — strip pairs of equal rank from the top of a draw pile. This micro-variant honours the rank-doubling spirit directly. Match doubles, swap to chase a triple, and aim for Excellent doubling.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
