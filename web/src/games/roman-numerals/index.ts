import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RomanNumeralsState, RomanNumeralsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RomanNumeralsGame } from "./Game.js";

export const romanNumeralsSettings = {
  direction: {
    kind: "enum" as const,
    label: "Direction",
    options: ["to-roman", "to-arabic"] as const,
    default: "to-arabic" as const,
  },
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

type RomanNumeralsSettingsType = SettingsOf<typeof romanNumeralsSettings>;

export const romanNumeralsPlugin: GamePlugin<RomanNumeralsState, RomanNumeralsAction, typeof romanNumeralsSettings> = {
  id: "roman-numerals",
  title: "Roman Numerals",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Convert between Roman numerals and Arabic numbers. Works both directions — decode XLII or encode 47.",
  howToPlay: `Roman Numerals drills the ancient numbering system used by the Romans and still seen on clock faces, book chapters, movie sequels, and sporting events.

The seven Roman symbols are: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Numbers are built by combining these symbols. When a smaller value precedes a larger one, it is subtracted — so IV = 4 (5−1), IX = 9 (10−1), XL = 40 (50−10), XC = 90, CD = 400, CM = 900. Otherwise symbols are added left to right: VIII = 8, XXIII = 23, MCMLXXXIV = 1984.

Two directions are available. "To Arabic" shows you a Roman numeral like XLVII and you type the number (47). "To Roman" shows a number like 47 and you type the Roman equivalent (XLVII). Input is accepted in uppercase; lowercase is converted automatically.

Easy difficulty covers numbers 1–20, teaching the basic symbols and simple combinations. Medium goes to 100, adding tens with L and C. Hard covers the full range to 3999 (the maximum standard Roman numeral), requiring fluency with all subtraction pairs.

Each correct answer scores 10 points. Wrong answers display the correct conversion so you can study the pattern.`,
  settings: romanNumeralsSettings,
  initialState: (seed: number, settings: RomanNumeralsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RomanNumeralsGame,
};
