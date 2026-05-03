import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MetaphorQuizState, MetaphorQuizAction, MetaphorQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MetaphorQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MetaphorQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const metaphorQuizPlugin: GamePlugin<MetaphorQuizState, MetaphorQuizAction, typeof settings> = {
  id: "metaphor-quiz", title: "Metaphor Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify metaphors and what they mean.",
  howToPlay: `Metaphor Quiz tests your understanding of metaphors — figures of speech that describe one thing as if it is another. Each question presents a metaphor and asks its meaning, or which option is a metaphor.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Metaphors enrich language: 'Time is a thief'; 'Life is a journey'. They help us think about abstract ideas through concrete images. Whether you are studying literature, writing essays, or just love wordplay, Metaphor Quiz sharpens insight. Score points, build skills!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MetaphorQuizSettings),
  reducer, isTerminal, 
  hint: (state: MetaphorQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MetaphorQuizGame,
};
