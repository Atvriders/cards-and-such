import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { NumberBondsState, NumberBondsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumberBondsGame } from "./Game.js";

export const numberBondsSettings = {
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["10", "20", "100"] as const,
    default: "10" as const,
  },
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
} as const;

type NumberBondsSettingsType = SettingsOf<typeof numberBondsSettings>;

export const numberBondsPlugin: GamePlugin<NumberBondsState, NumberBondsAction, typeof numberBondsSettings> = {
  id: "number-bonds",
  title: "Number Bonds",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the missing part of a number bond. If the whole is 10 and one part is 3, the other part is 7.",
  howToPlay: `Number Bonds builds instant recall of complementary number pairs — the building block of all mental arithmetic. A target number (the "whole") is shown at the top inside a circle, with one "part" shown below it. You must find the missing part that adds up to the whole.

For example: whole = 10, part = 3 → missing part = 7. This is because 3 + 7 = 10.

Number bonds to 10 are the most fundamental: 0+10, 1+9, 2+8, 3+7, 4+6, 5+5 and their reverses. Once these are automatic, addition and subtraction of any numbers becomes much faster because you can spot complementary pairs instantly.

Three target settings are available. Target 10 focuses on the classic number bonds all primary students must master. Target 20 extends to a harder but still essential set used in two-digit arithmetic. Target 100 covers bonds to 100 — useful for money calculations and percentage reasoning (knowing that 37 + 63 = 100 speeds up many mental tasks).

Each correct answer scores 10 points. The wrong answer screen shows the full bond so you can memorize the pair.

Practice tip: Quiz yourself in both directions. If 4 + 6 = 10, cover the 4 and quiz yourself on the missing part when you see 6, then reverse it. Speed comes from treating these pairs as single memory units rather than calculations.`,
  settings: numberBondsSettings,
  initialState: (seed: number, settings: NumberBondsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: NumberBondsState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-number-bonds-primary"]', pulses: 3 } : null),
  component: NumberBondsGame,
};
