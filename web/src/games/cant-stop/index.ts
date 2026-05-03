import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CantStopState, CantStopAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CantStop = /* @__PURE__ */ lazy(() => import("./CantStop.js").then((mod) => ({ default: mod.CantStop as unknown as React.ComponentType<unknown> })));
export const cantStopSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2"] as const,
    default: "1" as const,
  },
} as const;

type CantStopSettingsType = SettingsOf<typeof cantStopSettings>;

export const cantStopPlugin: GamePlugin<CantStopState, CantStopAction, typeof cantStopSettings> = {
  id: "cant-stop",
  title: "Can't Stop",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push your luck up 11 columns — claim 3 to win, but bust and lose your turn!",
  howToPlay: `Race to claim the tops of 3 columns on a board numbered 2–12, each of varying height: column 7 is tallest (13 steps), columns 2 and 12 are shortest (3 steps).

Each turn you roll 4 dice and split them into 2 pairs. Each pair's sum points to a column — advance a runner in each of those columns by 1 step. You may keep rolling as long as you have active runners in valid columns. At any point you may Bank to permanently record your runner positions, ending your turn.

The catch: you can only have runners in up to 3 columns at once. If a roll produces no pair that touches an available column, you Bust — all runners are lost and it's the next player's turn. First player to reach the top of exactly 3 columns wins.

Strategy tips: favour column 7, which is rolled most often. Columns 2 and 12 are risky but short. Once you've banked in a column, you're safe to re-enter it later. The longer you push, the more you risk losing your entire turn's work.`,
  settings: cantStopSettings,
  initialState: (seed: number, settings: CantStopSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-cant-stop-roll"]', pulses: 3 };
  },
  component: CantStop,
};
