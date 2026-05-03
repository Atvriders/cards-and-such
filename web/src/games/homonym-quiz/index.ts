import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HomonymQuizState, HomonymQuizAction, HomonymQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HomonymQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HomonymQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const homonymQuizPlugin: GamePlugin<HomonymQuizState, HomonymQuizAction, typeof settings> = {
  id: "homonym-quiz", title: "Homonym Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the homonym — words that sound or look the same but have different meanings.",
  howToPlay: `Homonym Quiz tests your understanding of words that sound the same or are spelled the same but have different meanings (homophones and homographs). Each question asks you to identify the correct word for a given context.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

English is full of trickery: 'bear' the animal versus 'bear' meaning to carry; 'their' versus 'there' versus 'they're'. Homonym Quiz drills the most common confusions, sharpening your spelling and writing instincts. Score points, build skills, and master the homonym maze!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HomonymQuizSettings),
  reducer, isTerminal, 
  hint: (state: HomonymQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: HomonymQuizGame,
};
