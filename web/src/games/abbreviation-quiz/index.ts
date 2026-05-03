import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbbreviationQuizState, AbbreviationQuizAction, AbbreviationQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbbreviationQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbbreviationQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const abbreviationQuizPlugin: GamePlugin<AbbreviationQuizState, AbbreviationQuizAction, typeof settings> = {
  id: "abbreviation-quiz", title: "Abbreviation Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify what common English abbreviations stand for.",
  howToPlay: `Abbreviation Quiz tests your knowledge of common English abbreviations — short forms used in writing, business, and daily life. Each question presents an abbreviation and asks what it stands for.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Abbreviations save space and time — 'etc.', 'e.g.', 'i.e.', 'a.m.', 'p.m.', 'PhD'. Knowing what they actually mean keeps you writing precisely. Whether for school, work, or general fluency, Abbreviation Quiz refreshes the basics. Score points, sharpen English skills!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbbreviationQuizSettings),
  reducer, isTerminal, 
  hint: (state: AbbreviationQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: AbbreviationQuizGame,
};
