import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RhymeQuizState, RhymeQuizAction, RhymeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RhymeQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RhymeQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const rhymeQuizPlugin: GamePlugin<RhymeQuizState, RhymeQuizAction, typeof settings> = {
  id: "rhyme-quiz", title: "Rhyme Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the word that rhymes with the given word.",
  howToPlay: `Rhyme Quiz challenges you to identify which of four words rhymes with a given target word. Rhymes follow English ear-rule: same ending vowel-consonant cluster, different starting consonant.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Rhyme recognition is fundamental for poetry, songwriting, and early reading instruction. Whether you are a budding lyricist, a parent helping your child read, or just a fan of wordplay, Rhyme Quiz keeps your ear sharp. Score points and build skills!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RhymeQuizSettings),
  reducer, isTerminal, 
  hint: (state: RhymeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: RhymeQuizGame,
};
