import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SubtractionSprintState, SubtractionSprintAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SubtractionSprintGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SubtractionSprintGame as unknown as React.ComponentType<unknown> })));
export const subtractionSprintSettings = {
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

type SubtractionSprintSettingsType = SettingsOf<typeof subtractionSprintSettings>;

export const subtractionSprintPlugin: GamePlugin<SubtractionSprintState, SubtractionSprintAction, typeof subtractionSprintSettings> = {
  id: "subtraction-sprint",
  title: "Subtraction Sprint",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drill subtraction problems at speed. The larger number minus the smaller — type the difference and hit Enter.",
  howToPlay: `Subtraction Sprint drills your subtraction facts in a fast-paced typing game. A subtraction problem appears on screen — the larger number is always on top so the result is never negative — and you type the difference, then press Enter or tap the button.

Each correct answer scores 10 points. Wrong answers score zero but the game moves on immediately so you never get stuck. A progress bar tracks how far through the round you are.

Three difficulty levels control the size of the numbers. Easy keeps both numbers between 1 and 20 — ideal for learners working on single-digit subtraction and small two-digit facts. Medium extends the range to 1–100, introducing borrowing across tens and hundreds. Hard uses numbers up to 999, demanding rapid column subtraction in your head.

Choose from 10, 20, or 50 questions per round. Ten is a warm-up; 50 is a full mental workout.

Tips: Subtraction is inverse addition — if you know 7 + 8 = 15, you instantly know 15 − 8 = 7. For larger numbers try counting up from the smaller to the larger (shop-assistant method): 73 − 48 means count from 48 to 73, which is 2 to 50 then 23 more = 25. Practice borrowing as a reflex: 82 − 47 means borrow from the tens, giving 12 − 7 = 5 in the ones place and 7 − 4 = 3 in the tens, so 35.`,
  settings: subtractionSprintSettings,
  initialState: (seed: number, settings: SubtractionSprintSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SubtractionSprintState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-subtraction-sprint-primary"]', pulses: 3 } : null),
  component: SubtractionSprintGame,
};
