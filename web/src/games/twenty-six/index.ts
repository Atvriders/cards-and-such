import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentySixState, TwentySixAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentySix } from "./TwentySix.js";

const twentySixSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["1", "3"] as const,
    default: "1" as const,
  },
} as const;

type TwentySixSettingsType = SettingsOf<typeof twentySixSettings>;

export const twentySixPlugin: GamePlugin<TwentySixState, TwentySixAction, typeof twentySixSettings> = {
  id: "twenty-six",
  title: "Twenty-Six",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick a number 1–6, roll 10 dice 13 times, and count how many times it appears.",
  howToPlay: `Twenty-Six is a casino dice game popular in Chicago during the mid-20th century. Before rolling, you choose a lucky number from 1 to 6. Then roll 10 dice exactly 13 times, counting how many of your chosen number appear across all 130 die rolls.

Your expected result is about 21–22 hits (130 ÷ 6 ≈ 21.7). The payout table rewards unusual results in either direction. Around 13 hits is break-even territory. Fewer than 8 hits means a large penalty. Getting 20 or more hits earns a bonus, with 25 or 26 hits paying the jackpot.

After each roll the dice are displayed — your lucky number is highlighted in green. Watch the hit counter climb (or stall) as you complete all 13 rolls. Click Roll after each throw to continue.

Your score after one round is your payout. Play 3 rounds to accumulate a total. The game is largely luck-based, but the tension of watching your number appear (or not) makes each roll exciting.

Payout guide: ≥26 hits = +6, ≥25 = +4, ≥22 = +2, ≥20 = +1, ≥14 = 0, ≥10 = −1, ≥8 = −2, <8 = −3.`,
  settings: twentySixSettings,
  initialState: (seed: number, settings: TwentySixSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TwentySix,
};
