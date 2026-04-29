import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const carpetSoliPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "carpet-soli",
  title: "Carpet Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Twenty-card carpet with four-ace foundations; low-card bonus.",
  howToPlay: "Carpet Solitaire deals four aces above a twenty-card carpet, with the foundations played to ace-up — here adapted as a ten-round seeded hand variant where low-rank clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of low cards (Ace through 5) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nCarpet's twenty-card open layout makes it among the friendlier introductory patiences. This micro-variant honours the early-low foundation push by rewarding low-card concentration. Lay your carpet, swap toward the lows, and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
