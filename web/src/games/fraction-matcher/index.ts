import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FractionMatcherState, FractionMatcherAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FractionMatcherGame } from "./Game.js";

export const fractionMatcherSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["decimal", "equivalent", "mixed"] as const,
    default: "mixed" as const,
  },
} as const;

type FractionMatcherSettingsType = SettingsOf<typeof fractionMatcherSettings>;

export const fractionMatcherPlugin: GamePlugin<FractionMatcherState, FractionMatcherAction, typeof fractionMatcherSettings> = {
  id: "fraction-matcher",
  title: "Fraction Matcher",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A fraction appears on screen. Pick its decimal value or an equivalent fraction from four choices.",
  howToPlay: `Fraction Matcher shows you a fraction — displayed large with numerator over denominator — and asks you to identify either its decimal equivalent or an equivalent fraction from four multiple-choice options.

In Decimal mode every question asks you to convert the displayed fraction to its decimal form. For example, 3/4 corresponds to 0.75. In Equivalent mode you pick another fraction that represents the same value, such as recognising that 2/8 equals 1/4. Mixed mode alternates randomly between the two question types, keeping you on your toes.

Click the answer you believe is correct to highlight it, then press Submit. After submitting the correct answer lights up green and any wrong pick turns red. Click Next to continue.

Each correct answer scores 10 points. You can play 10, 20, or 30 rounds per session.

Tips: Memorise the most common decimal equivalents: 1/2 = 0.5, 1/4 = 0.25, 3/4 = 0.75, 1/3 ≈ 0.333, 2/3 ≈ 0.667, 1/5 = 0.2, 1/8 = 0.125. For equivalent fractions, multiply or divide both numerator and denominator by the same number. If both share a common factor, reduce to lowest terms and see which choice simplifies to the same thing.`,
  settings: fractionMatcherSettings,
  initialState: (seed: number, settings: FractionMatcherSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FractionMatcherState) => {
    if (state.phase === "done") return null;
    return { selector: ".fm-btn.submit, .fm-btn.next", pulses: 3 };
  },
  component: FractionMatcherGame,
};
