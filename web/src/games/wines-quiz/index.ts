import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WinesQuizState, WinesQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WinesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WinesQuiz as unknown as React.ComponentType<unknown> })));
export const winesQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof winesQuizSettings>;

export const winesQuizPlugin: GamePlugin<WinesQuizState, WinesQuizAction, typeof winesQuizSettings> = {
  id: "wines-quiz",
  title: "Wines Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your wine knowledge — grape varieties, regions, classifications, and famous châteaux.",
  howToPlay: `Wines Quiz explores the world of wine — from grape varieties and famous regions to production methods and classification systems. Each question describes a wine characteristic, appellation, or style and asks you to identify the correct answer from four choices.

Select the right answer to earn 10 points. Correct selections turn green; wrong ones turn red. Press Next to proceed.

Questions cover Old World wines (France, Italy, Spain, Germany) and New World regions (California, Argentina, New Zealand, Australia), as well as sparkling wines, fortified wines, and natural wine techniques.

Choose 5, 10, or 15 questions to suit your expertise. Beginners will enjoy shorter rounds while enthusiasts can tackle the full 15-question challenge.

Tips: Region and grape variety go hand in hand — Burgundy means Pinot Noir or Chardonnay; Barolo means Nebbiolo. Sparkling wine clues often refer to the method (méthode traditionnelle) or region (only Champagne calls itself Champagne). Fortified wines like Port and Sherry have specific geographic protections. When a question mentions frozen grapes, think Icewine; when it mentions noble rot, think Sauternes. Classification terms like 'Reserva' or 'Grand Cru' signal prestige tier questions.`,
  settings: winesQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WinesQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: WinesQuiz,
};
