import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QueensState, QueensAction, QueensSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QueensQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QueensQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const queensQuizPlugin: GamePlugin<QueensState, QueensAction, typeof settings> = {
  id: "queens-quiz", title: "Queens Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of history's most powerful queens — from Cleopatra and Elizabeth I to Victoria and Catherine the Great.",
  howToPlay: `Queens Quiz celebrates the women who held supreme power across history's greatest civilizations. Questions span ancient Egypt, medieval Europe, the Renaissance, and the modern era — covering queens regnant, regent queens, and legendary consorts who shaped empires.

You have 15 seconds to answer each question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Quick, confident answers score highest.

Click your choice and press Submit. The correct answer highlights green; wrong selections turn red. Press Next to advance.

Settings let you choose 10, 20, or 30 questions. Topics include Cleopatra, Elizabeth I, Catherine the Great, Hatshepsut, Victoria, and many lesser-known but equally remarkable rulers from Africa, Asia, and the Americas.

From the pharaohs of ancient Egypt to the queens of 20th-century Europe, this quiz reveals the fascinating and often underappreciated stories of women who ruled!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as QueensSettings),
  reducer, isTerminal, 
  hint: (state: QueensState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: QueensQuiz,
};
