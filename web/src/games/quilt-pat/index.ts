import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quiltPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "quilt-pat",
  title: "Quilt",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4x13 grid sequence-builder; runs scoring.",
  howToPlay: "Quilt is a four-by-thirteen grid patience that builds row sequences — here adapted as a ten-round seeded hand variant where ascending runs in your hand drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to twice the squared length of the longest ascending run (a three-run pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Quilt patience requires building each row of thirteen as a complete suit run — a marathon achievement. This micro-variant honours that goal by rewarding the longest run you can build into a single hand. Keep your runs intact, swap to mend a tear, and aim for an Excellent quilt.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
