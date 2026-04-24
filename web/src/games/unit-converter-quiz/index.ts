import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnitConverterState, UnitConverterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnitConverterQuizGame } from "./Game.js";

export const unitConverterSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["15", "20", "30"] as const,
    default: "15" as const,
  },
  category: {
    kind: "enum" as const,
    label: "Category",
    options: ["all", "length", "weight", "temperature"] as const,
    default: "all" as const,
  },
} as const;

type UnitConverterSettingsType = SettingsOf<typeof unitConverterSettings>;

export const unitConverterQuizPlugin: GamePlugin<UnitConverterState, UnitConverterAction, typeof unitConverterSettings> = {
  id: "unit-converter-quiz",
  title: "Unit Converter Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Convert between metric and imperial units. Length, weight, and temperature. Multiple choice, 4 options.",
  howToPlay: `Unit Converter Quiz tests your real-world measurement knowledge across three categories: length (meters, feet, miles, kilometres), weight (kilograms, pounds, ounces, grams), and temperature (Celsius, Fahrenheit, Kelvin).

Each question presents a conversion — for example "1 kilometer = ? miles" — and four multiple-choice answers. Click the answer you believe is correct to highlight it, then press Submit. After submitting the correct answer turns green, and any wrong selection turns red. Click Next to continue to the next question.

Each correct answer scores 10 points. You can restrict the questions to a single category using the Category setting, or leave it on "all" for a mixed challenge. Rounds can be set to 15, 20, or 30 questions.

Key conversions worth memorising: 1 inch = 2.54 cm, 1 mile ≈ 1.609 km, 1 kg ≈ 2.205 lb, 0°C = 32°F (freezing), 100°C = 212°F (boiling), body temperature is 37°C or 98.6°F. For Celsius to Fahrenheit: multiply by 9/5 and add 32. For Fahrenheit to Celsius: subtract 32 and multiply by 5/9.

Tips: Round numbers are easier to check — 0°C, 100°C, and -40°C (where both scales meet) are good anchors. For weight, remember that a litre of water weighs about 1 kg, and 1 kg is just over 2 pounds.`,
  settings: unitConverterSettings,
  initialState: (seed: number, settings: UnitConverterSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: UnitConverterQuizGame,
};
