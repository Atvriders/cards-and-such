import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StreakingKittensQuizState, StreakingKittensQuizAction, StreakingKittensQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StreakingKittensQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StreakingKittensQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const streakingKittensQuizPlugin: GamePlugin<StreakingKittensQuizState, StreakingKittensQuizAction, typeof settings> = {
  id:"streaking-kittens-quiz", title:"Streaking Kittens Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Streaking Kittens, the second Exploding Kittens expansion.",
  howToPlay:"Streaking Kittens Trivia is a ten-question quiz about the second deck expansion for Exploding Kittens. Streaking Kittens adds a single new exploding-kitten variant: the Streaking Kitten, which one player can hide indefinitely without losing as long as they hold a defuse. Each round you'll be tested on the new card types — Curse of the Cat Butt, Bury, Personal Attack, Catomic Bomb — and how they twist play. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so move fast. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions your final score is displayed. Streaking Kittens is famed for adding chaos to the chaos, leaning into the deck-builder's most absurd impulses — see how much of its strangeness you can recall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StreakingKittensQuizSettings),
  reducer,isTerminal,
  hint: (state: StreakingKittensQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StreakingKittensQuizGame,
};
