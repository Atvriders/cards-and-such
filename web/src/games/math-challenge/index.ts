import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MathChallengeState, MathChallengeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MathChallenge } from "./MathChallenge.js";

export const mathChallengeSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "120"] as const,
    default: "60" as const,
  },
  operations: {
    kind: "enum" as const,
    label: "Operations",
    options: ["add-sub", "all"] as const,
    default: "add-sub" as const,
  },
} as const;

type MathChallengeSettingsType = SettingsOf<typeof mathChallengeSettings>;

export const mathChallengePlugin: GamePlugin<MathChallengeState, MathChallengeAction, typeof mathChallengeSettings> = {
  id: "math-challenge",
  title: "Math Challenge",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve rapid math problems before the 5-second timer runs out. Each correct answer scores 10 points.",
  howToPlay: `A math equation appears on screen with a 5-second countdown bar. Type your answer into the box and press Enter or click the button before time runs out. Each correct answer earns 10 points. If the timer expires or you skip, the problem advances automatically with no points earned.

Problems start easy and get harder as time passes. Numbers grow larger throughout the session, so early problems might be 4 + 7 while later ones could be 87 + 63. If you enable the "all" operations setting, multiplication is also included — multiplications are kept to 12×12 at most.

The game runs for 30, 60, or 120 seconds. Your final score is shown along with your correct/total ratio.

Tips: On addition and subtraction, look for patterns: round up one number then adjust. For example, 38 + 47 is easier as 40 + 47 - 2 = 85. Don't spend more than 3 seconds on a single problem — a wrong answer costs nothing but a missed answer wastes the full 5 seconds. Type only digits; decimals and spaces are stripped automatically. Work through the session at a steady rhythm rather than rushing, especially on longer durations.`,
  settings: mathChallengeSettings,
  initialState: (seed: number, settings: MathChallengeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mc-problem-bar-wrap")) ? { selector: ".mc-problem-bar-wrap", pulses: 3 } : null,
  component: MathChallenge,
};
