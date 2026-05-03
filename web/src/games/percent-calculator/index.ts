import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PercentCalculatorState, PercentCalculatorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PercentCalculatorGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PercentCalculatorGame as unknown as React.ComponentType<unknown> })));
export const percentCalculatorSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Problems",
    options: ["20", "30", "50"] as const,
    default: "20" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type PercentCalculatorSettingsType = SettingsOf<typeof percentCalculatorSettings>;

export const percentCalculatorPlugin: GamePlugin<PercentCalculatorState, PercentCalculatorAction, typeof percentCalculatorSettings> = {
  id: "percent-calculator",
  title: "Percent Calculator",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick-fire percent problems: calculate 15% of 80, 25% of 40, etc. 90-second countdown.",
  howToPlay: `Percent Calculator is a quick-fire mental maths workout. A percent problem appears — for example "25% of 80 = ?" — and you type the numerical answer into the input box, then press Enter or the button to submit. A 90-second countdown timer is running, so work fast.

Each correct answer earns 10 points and advances to the next problem. A wrong answer scores zero but still advances, letting you keep your rhythm. If you finish all the problems before 90 seconds expire, the game ends immediately with your score.

Easy difficulty uses common percentages (10%, 25%, 50%, 75%) with round base numbers (multiples of 10), making mental arithmetic straightforward. Medium expands to more percentages and finer base numbers. Hard uses less predictable percentages and arbitrary base numbers that require more calculation.

Tips: The 10% shortcut — move the decimal point one place left. 15% = 10% + 5% (half of 10%). 25% = divide by 4. 50% = divide by 2. 75% = 50% + 25%. For harder problems, find 1% first (divide by 100) then multiply by the percent. Decimal answers are accepted, so 15% of 33 = 4.95 is valid — type it without the percent sign.`,
  settings: percentCalculatorSettings,
  initialState: (seed: number, settings: PercentCalculatorSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: PercentCalculatorState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-percent-calculator-primary"]', pulses: 3 } : null),
  component: PercentCalculatorGame,
};
