import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const florentineSoliPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "florentine-soli",
  title: "Florentine Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four Seasons cousin with cross layout; runs scoring.",
  howToPlay: "Florentine Patience is a Four Seasons cousin with a cross-shaped tableau and four foundations that build in either direction — here adapted as a ten-round seeded hand variant where ascending runs drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to twice the squared length of the longest ascending run (a three-run pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded.\n\nThe historical Florentine Patience adds a tactical wrinkle to Four Seasons: foundation direction is chosen on the fly. This micro-variant honors that flexibility by rewarding runs of any direction. Keep runs tight, swap thoughtfully, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
