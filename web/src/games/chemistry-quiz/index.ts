import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChemistryQuizState, ChemistryQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChemistryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChemistryQuizGame as unknown as React.ComponentType<unknown> })));
export const chemistryQuizSettings = {
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["name-to-symbol", "symbol-to-name", "mixed"] as const,
    default: "mixed" as const,
  },
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type ChemistryQuizSettingsType = SettingsOf<typeof chemistryQuizSettings>;

export const chemistryQuizPlugin: GamePlugin<ChemistryQuizState, ChemistryQuizAction, typeof chemistryQuizSettings> = {
  id: "chemistry-quiz",
  title: "Chemistry Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of all 118 elements. Match element names to symbols and vice versa.",
  howToPlay: `Chemistry Quiz drills the periodic table in both directions. Each question either shows you an element name and asks for its chemical symbol, or shows you a symbol and asks for its full name. All 118 elements from Hydrogen (H) to Oganesson (Og) are included in the pool.

In Name-to-Symbol mode every question reads "What is the chemical symbol for [element]?" In Symbol-to-Name mode every question reads "The symbol [X] belongs to which element?" Mixed mode randomly alternates between the two formats, testing recall in both directions.

Four choices appear for each question. Click the one you think is correct, then press Submit. The correct answer lights up green; if you chose wrong, your pick turns red and the correct answer is revealed. Press Next to continue.

Each correct answer earns 10 points. Sessions are 10, 20, or 30 questions.

Tips: Many symbols match the English name directly (H = Hydrogen, O = Oxygen, C = Carbon). Others come from Latin: Fe = Iron (Ferrum), Cu = Copper (Cuprum), Au = Gold (Aurum), Ag = Silver (Argentum), Na = Sodium (Natrium), K = Potassium (Kalium), Pb = Lead (Plumbum), Hg = Mercury (Hydrargyrum), Sn = Tin (Stannum). Learning these exceptions is the biggest hurdle for most players.`,
  settings: chemistryQuizSettings,
  initialState: (seed: number, settings: ChemistryQuizSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: ChemistryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ChemistryQuizGame,
};
