import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChoHanState, ChoHanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChoHan = /* @__PURE__ */ lazy(() => import("./ChoHan.js").then((mod) => ({ default: mod.ChoHan as unknown as React.ComponentType<unknown> })));
export const choHanSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "25", "50"] as const,
    default: "10",
  },
  betSize: {
    kind: "enum" as const,
    label: "Bet Size",
    options: ["10", "25", "100"] as const,
    default: "25",
  },
} as const;

type ChoHanSettingsType = SettingsOf<typeof choHanSettings>;

export const choHanPlugin: GamePlugin<ChoHanState, ChoHanAction, typeof choHanSettings> = {
  id: "cho-han",
  title: "Chō-han",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Japanese 2-dice gambling game. Bet Chō (even) or Han (odd) on the dice sum.",
  howToPlay: `Chō-han is a traditional Japanese gambling game with simple rules and ancient origins. A dealer shakes two dice in a bamboo cup, then slams it on the table. Players bet on whether the sum of the two dice will be even (Chō) or odd (Han) before the cup is lifted.

Even sums (Chō): 2, 4, 6, 8, 10, 12.
Odd sums (Han): 3, 5, 7, 9, 11.

Both bets pay 1:1 — bet 25, win 25. The game is close to 50/50, making it a pure test of luck and nerve.

Start with 1,000 in your bankroll. Choose your bet size (10, 25, or 100 per round) in settings. Each round, click Chō or Han — the dice are immediately revealed and your result shown. After the result, click Next Round to continue.

Note that 2 is even (Chō) and 12 is even (Chō), while 3 and 11 are odd (Han). Because there are slightly fewer ways to make even sums than odd (due to the distribution), Han has a very slight edge in theory — but in practice it's nearly even.

Try to grow your bankroll over 10, 25, or 50 rounds. End with more than 1,000 for a profit!`,
  settings: choHanSettings,
  initialState: (seed: number, settings: ChoHanSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-cho-han-bet"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-cho-han-bet"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-cho-han-next"]', pulses: 3 };
  },
  component: ChoHan,
};
