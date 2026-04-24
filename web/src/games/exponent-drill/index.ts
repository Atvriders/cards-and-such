import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ExponentDrillState, ExponentDrillAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ExponentDrillGame } from "./Game.js";

export const exponentDrillSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
} as const;

type ExponentDrillSettingsType = SettingsOf<typeof exponentDrillSettings>;

export const exponentDrillPlugin: GamePlugin<ExponentDrillState, ExponentDrillAction, typeof exponentDrillSettings> = {
  id: "exponent-drill",
  title: "Exponent Drill",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Evaluate powers — base raised to an exponent. From 2² to 12⁵. Type the result and hit Enter.",
  howToPlay: `Exponent Drill gives you a base raised to a power — like 4³ — and you must compute the result and type it in. Press Enter to submit.

An exponent tells you how many times to multiply the base by itself. So 4³ means 4 × 4 × 4 = 64. The small raised number (superscript) is the exponent; the larger number below it is the base.

Easy difficulty uses bases from 2 to 5 and exponents from 2 to 4, keeping answers below 625. This covers the squares and cubes everyone should memorize: 2²=4, 3²=9, 4²=16, 5²=25, 2³=8, 3³=27, 4³=64.

Medium raises bases up to 10 and keeps exponents at 2–4, so you may need to compute things like 7³ = 343 or 9⁴ = 6561.

Hard extends bases to 12 and adds exponents up to 5, requiring calculation of numbers like 11⁴ = 14641.

Each correct answer scores 10 points. Wrong answers reveal the correct value.

Tips: Memorize perfect squares up to 15² = 225 and cubes up to 10³ = 1000. For larger powers, break the calculation: 6⁴ = (6²)² = 36² = 1296. The doubling rule for powers of 2 is invaluable: 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32, 2⁶=64, 2⁷=128, 2⁸=256, 2⁹=512, 2¹⁰=1024.`,
  settings: exponentDrillSettings,
  initialState: (seed: number, settings: ExponentDrillSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ExponentDrillGame,
};
