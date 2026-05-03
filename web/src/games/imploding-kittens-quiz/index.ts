import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ImplodingKittensQuizState, ImplodingKittensQuizAction, ImplodingKittensQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ImplodingKittensQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ImplodingKittensQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const implodingKittensQuizPlugin: GamePlugin<ImplodingKittensQuizState, ImplodingKittensQuizAction, typeof settings> = {
  id:"imploding-kittens-quiz", title:"Imploding Kittens Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Imploding Kittens, the first expansion to Exploding Kittens.",
  howToPlay:"Imploding Kittens Trivia is a ten-question quiz about the first expansion to the cult Exploding Kittens deck. Imploding Kittens adds twenty new cards plus a Cone of Shame to mark the player who must draw next, increasing the player count from five to six. Each round asks about the new card types — Reverse, Targeted Attack, Feral Cat, Alter the Future — the role of the imploding kitten card itself which can't be defused, the Cone of Shame, and how it merges with the base deck. Tap the answer you believe is correct and press Submit; a correct answer awards 100 base points plus 10 points per second left on the 15-second timer, rewarding quick recall. A wrong answer reveals the correct option and locks the round before allowing Next. After ten questions, your final score is displayed. Imploding Kittens added genuinely fresh strategy to a riot of luck-based play — see how well you remember its twists.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ImplodingKittensQuizSettings),
  reducer,isTerminal,
  hint: (state: ImplodingKittensQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ImplodingKittensQuizGame,
};
