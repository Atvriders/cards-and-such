import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const eagleWingPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "eagle-wing-pat",
  title: "Eagle Wing",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reserve-heavy Canfield cousin in wing shape; odd-card bonus.",
  howToPlay: "Eagle Wing is a reserve-heavy Canfield cousin laid out in a sweeping wing shape with a thirteen-card spine reserve, here adapted as a ten-round seeded hand variant where odd-rank clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of odd-rank cards (A, 3, 5, 7, 9, J, K) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound over ten rounds. Typical totals fall between forty and one hundred ten; rating cutoffs are Pass, Fair, Good, Excellent. The deal is fully seeded.\n\nThe original Eagle Wing layout is one of the more visually striking Canfield variants. This micro-variant rewards aiming for odd-rank concentration. Spread your wings, swap toward the odds, and soar to Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: ".play-restart-btn", pulses: 3 },
  component: SoliGame,
};
