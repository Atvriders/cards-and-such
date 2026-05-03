import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrammarFixState, GrammarFixAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GrammarFix = /* @__PURE__ */ lazy(() => import("./GrammarFix.js").then((mod) => ({ default: mod.GrammarFix as unknown as React.ComponentType<unknown> })));
export const grammarFixSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type GrammarFixSettingsType = SettingsOf<typeof grammarFixSettings>;

export const grammarFixPlugin: GamePlugin<GrammarFixState, GrammarFixAction, typeof grammarFixSettings> = {
  id: "grammar-fix",
  title: "Grammar Fix",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the grammar error and pick the corrected version of the sentence.",
  howToPlay: `Grammar Fix presents sentences containing common English grammar mistakes. Your task is to pick the corrected version from the four options shown.

Each round begins with an incorrectly written sentence displayed in red. Read all four answer choices carefully, then click or tap the one that is grammatically correct. After answering, the correct choice turns green, any wrong pick turns red, and a brief explanation appears explaining the grammar rule involved.

Correct answers earn 10 points each. Work through all questions to see your final score.

Settings allow you to choose 5, 10, or 15 questions per game.

Tips: Watch for subject-verb agreement errors (we was → we were), incorrect pronoun cases (me and him → he and I), confused homophones (its / it's, there / they're), double negatives, wrong verb forms (I seen → I saw), and misuse of fewer vs. less. Reading the explanation after each answer helps you internalize the rule for future questions. Grammar Fix covers some of the most commonly confused rules in everyday English writing.`,
  settings: grammarFixSettings,
  initialState: (seed: number, settings: GrammarFixSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".gf-next", pulses: 3 }; },
  component: GrammarFix,
};
