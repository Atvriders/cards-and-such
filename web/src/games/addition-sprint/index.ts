import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AdditionSprintState, AdditionSprintAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AdditionSprintGame } from "./Game.js";

export const additionSprintSettings = {
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

type AdditionSprintSettingsType = SettingsOf<typeof additionSprintSettings>;

export const additionSprintPlugin: GamePlugin<AdditionSprintState, AdditionSprintAction, typeof additionSprintSettings> = {
  id: "addition-sprint",
  title: "Addition Sprint",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race through addition problems as fast as you can. Type the sum and press Enter to advance.",
  howToPlay: `Addition Sprint is a rapid-fire arithmetic drill that builds your addition speed and mental math confidence. Each round presents a series of addition problems — two numbers appear on screen and you type their sum, then press Enter or tap the button to advance.

Each correct answer scores 10 points. Wrong answers score zero but still move you to the next problem so your flow is never broken. A progress bar at the top shows how far through the round you are.

Three difficulty levels control the size of the numbers. Easy keeps both addends between 1 and 20 — perfect for children learning basic addition facts. Medium raises the range to 1–100, introducing two-digit and three-digit sums. Hard goes up to 999, requiring full mental arithmetic or column addition under pressure.

The Questions setting lets you choose rounds of 10, 20, or 50 problems. Start with 10 to get a feel for the pace, then move up to 50 for a serious drill session.

Tips for improving: Group numbers to round tens — if you see 47 + 36, think 47 + 33 = 80, then add 3 more for 83. Look for doubles: 48 + 48 = 96. Practice carrying quickly: 67 + 55 means 60 + 50 = 110, plus 7 + 5 = 12, total 122. Regular daily drilling builds automatic recall and speeds up all arithmetic.`,
  settings: additionSprintSettings,
  initialState: (seed: number, settings: AdditionSprintSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: AdditionSprintState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-addition-sprint-primary"]', pulses: 3 } : null),
  component: AdditionSprintGame,
};
