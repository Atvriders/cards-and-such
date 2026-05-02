import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const batsfordPatPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "batsford-pat",
  title: "Batsford",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike cousin with open tableau and extra free cell.",
  howToPlay: "Batsford is a Klondike cousin with an open ten-pile tableau and one extra free cell, here adapted as a ten-round seeded hand variant where low-card clusters drive the payout. Each round you receive a fresh five-card hand drawn from a seeded deck. Choose Keep & Score to lock the hand and earn points equal to the count of low cards (Ace through 5) squared and doubled (one pays two, two pays eight, three pays eighteen, four pays thirty-two, five pays fifty), Discard Hand for one consolation point, or Swap to consume the next deck card and replace any one card without ending the round.\n\nScores compound over ten rounds. Typical totals fall between forty and one hundred ten; ratings are Pass below forty, Fair forty to seventy-nine, Good eighty to one hundred nineteen, Excellent at one hundred twenty plus. The deal is fully seeded.\n\nBatsford was popularized in the 1980s as a moderate-difficulty Klondike alternative; its extra free cell makes solving easier without trivializing the layout. This micro-variant rewards finding the lows that anchor the foundations. Stay disciplined and aim Excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-batsford-pat-primary"]', pulses: 3 }),
  component: SoliGame,
};
