import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentySixState, TwentySixAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TwentySix = /* @__PURE__ */ lazy(() => import("./TwentySix.js").then((mod) => ({ default: mod.TwentySix as unknown as React.ComponentType<unknown> })));
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
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-twenty-six-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-twenty-six-roll"]', pulses: 3 };
  },
  component: TwentySix,
};
