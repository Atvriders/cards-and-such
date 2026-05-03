import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BluesQuizState, BluesQuizAction, BluesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BluesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BluesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bluesQuizPlugin: GamePlugin<BluesQuizState, BluesQuizAction, typeof settings> = {
  id:"blues-quiz", title:"Blues Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Blues from delta country to Chicago electric: Robert Johnson to BB King.",
  howToPlay:`Blues Music Quiz traces the heart of American blues, from the Delta of Robert Johnson and Son House through Memphis (B.B. King), Chicago electric (Muddy Waters, Howlin' Wolf), West Coast (T-Bone Walker), and the white blues revival (Eric Clapton, Stevie Ray Vaughan). Questions cover key tunes, signature guitars, record labels, and the artists who shaped a century of feeling.

You have 15 seconds per question. A correct answer is worth 100 base points plus 10 per second remaining on the clock — answer fast for the high score. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong answers turn red, and the right answer is revealed before you advance. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. From crossroads legends to chitlin'-circuit heroes, dig into the deep blue!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BluesQuizSettings),
  reducer,isTerminal,
  hint: (state: BluesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BluesQuizGame,
};
