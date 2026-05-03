import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaintersQuizState, PaintersQuizAction, PaintersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PaintersQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PaintersQuiz as unknown as React.ComponentType<unknown> })));
const paintersQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof paintersQuizPluginSettings>;

export const paintersQuizPlugin: GamePlugin<PaintersQuizState, PaintersQuizAction, typeof paintersQuizPluginSettings> = {
  id: "painters-quiz",
  title: "Painters Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of famous painters and their masterworks — from Renaissance masters to modern icons.",
  howToPlay: `Painters Quiz challenges your knowledge of art history's greatest creators. Questions cover famous paintings and their artists, art movements from Impressionism to Pop Art, techniques like pointillism and drip painting, and surprising facts about the world's most beloved artworks.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions cover artists from da Vinci to Banksy, and works from the Sistine Chapel to Campbell Soup Cans.

Score and accuracy are displayed at the end. Whether you frequent galleries or just admire great art, Painters Quiz will sharpen your artistic eye!`,
  settings: paintersQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as PaintersQuizSettings),
  reducer, isTerminal, 
  hint: (state: PaintersQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PaintersQuiz,
};
