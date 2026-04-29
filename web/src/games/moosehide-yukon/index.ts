import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const moosehideYukonPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "moosehide-yukon",
  title: "Moosehide",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yukon variant with reverse-color tableau rule; even-card bonus.",
  howToPlay: "Moosehide is a Yukon relative with a reverse-color tableau rule (build down on the same color rather than alternating), here adapted as a ten-round seeded hand variant where even-rank clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of even-rank cards (2, 4, 6, 8, 10, Q) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass below forty, Fair forty to seventy-nine, Good eighty to one hundred nineteen, Excellent at one hundred twenty plus. The deal is fully seeded for replay.\n\nMoosehide is a Northern variant of Yukon with a counter-intuitive build rule that some players find easier and others harder. Track even ranks and swap toward them for the strongest scores.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
