import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bisleyKingPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "bisley-king",
  title: "Bisley Kings",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bisley cousin with kings emphasized; high-card bonus.",
  howToPlay: "Bisley Kings is a Bisley cousin where kings anchor the bottom of the layout and middle ranks fill in — here adapted as a ten-round seeded hand variant where high-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of high cards (J, Q, K, A) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass, Fair, Good, Excellent at the standard cutoffs. The deal is fully seeded for replay.\n\nThe original Bisley uses a thirteen-column layout where aces and kings each found a foundation working toward the middle. Bisley Kings emphasizes the king-side of that race. This micro-variant rewards royal concentration. Crown your kings and aim for Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
