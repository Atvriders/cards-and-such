import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { NumberMemoryState, NumberMemoryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumberMemory } from "./Game.js";

export const numberMemorySettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Digit Count",
    options: ["3", "5", "7", "9"] as const,
    default: "5" as const,
  },
} as const;

type NMSettings = SettingsOf<typeof numberMemorySettings>;

export const numberMemoryPlugin: GamePlugin<NumberMemoryState, NumberMemoryAction, typeof numberMemorySettings> = {
  id: "number-memory",
  title: "Number Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A number flashes briefly — memorize it and type it back!",
  howToPlay: `Number Memory tests your short-term recall for digits. At the start of each round, a number flashes on screen for exactly 2 seconds. Your job is to memorize every digit in order, then type it back perfectly using the on-screen keypad.

Choose your difficulty before starting: Easy shows 3-digit numbers, Medium shows 5-digit numbers, Hard shows 7 digits, and Expert pushes you to 9 digits. Each correct answer scores points based on the digit count, and a bonus is added for your longest correct streak.

There are 10 rounds per game. Watch the number carefully — you cannot pause the timer. Once the number disappears, type your answer using the digit buttons and press OK. If you make a typo, use the backspace key to correct it before submitting.

Tips: chunk long numbers into groups of 3 or 4 (like a phone number). Say the digits quietly in your head as you read them. For 7- and 9-digit numbers, try to form a vivid association — turn 7394 into "73 is my grandmother's age, 94 was a great year." With practice, your working-memory capacity will genuinely expand. Aim for a perfect 10-round streak for maximum score!`,
  settings: numberMemorySettings,
  initialState: (seed: number, settings: NMSettings) => initialState(seed, settings),
  reducer,
  isTerminal, hint: (state: NumberMemoryState): HintTarget | null => (state.phase === "idle" ? { selector: '[data-testid="hint-target-number-memory-primary"]', pulses: 3 } : null),
  component: NumberMemory,
};
