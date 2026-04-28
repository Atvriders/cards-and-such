import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaydayState, PaydayAction, PaydaySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaydayMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const paydayMiniPlugin: GamePlugin<PaydayState, PaydayAction, typeof settings> = {
  id: "payday-mini",
  title: "Payday Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "30-day calendar. Each day rolls income or a bill. Survive the month with positive net worth.",
  howToPlay: `Payday Mini is a tiny budgeting game inspired by the 1975 Parker Brothers PAYDAY board. You play a single 30-day month and try to finish with as much cash in the bank as you can.

How to play:
1. You start day 1 with $200 in the bank.
2. Each day press Roll Day to draw a financial event. Each roll picks one of four income tiers (side gig, freelance, bonus, or PAYDAY) or one of four bill tiers (coffee, groceries, bill, or rent), based on a coin-flip biased toward income on weekends.
3. Press Next Day to advance the calendar.

Daily events range from +$50 to +$200 income, or –$30 to –$180 bills. Weekends (days 5, 6, 12, 13, 19, 20, 26, 27 of the month roll) tilt toward income. The biggest single hits are PAYDAY (+$200) and Rent (–$180).

After all 30 days the game ends. Your final score is whatever cash you have left in the bank — strive to finish above $500 and bragging rights kick in around $1500. Anything below your starting $200 means it was a rough month.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PaydaySettings),
  reducer,
  isTerminal,
  component: PaydayMiniGame,
};
