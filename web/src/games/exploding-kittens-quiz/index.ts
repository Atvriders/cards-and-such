import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ExplodingKittensQuizState, ExplodingKittensQuizAction, ExplodingKittensQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ExplodingKittensQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ExplodingKittensQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const explodingKittensQuizPlugin: GamePlugin<ExplodingKittensQuizState, ExplodingKittensQuizAction, typeof settings> = {
  id:"exploding-kittens-quiz", title:"Exploding Kittens Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Exploding Kittens, the cult Russian-roulette cat-themed card game.",
  howToPlay:"Exploding Kittens Trivia is a ten-question quiz dedicated to the smash-hit Kickstarter card game where players draw from a deck packed with exploding kittens, defusing them with everything from laser pointers to belly rubs. Each round tests your knowledge of the game's creators (Elan Lee, Matthew Inman, Shane Small), its categories of cards (Action, Defuse, Exploding Kitten), its NSFW edition, and its record-breaking crowdfunding history. Tap the answer you believe is correct and press Submit. A correct answer awards 100 base points plus 10 per second left on the 15-second timer, so speed counts. A wrong answer reveals the correct option and locks the round before letting you press Next. After ten questions your final score is displayed. Exploding Kittens turned a one-illustrator weekend prototype into a global phenomenon — see how much trivia about its furry mayhem you can remember.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ExplodingKittensQuizSettings),
  reducer,isTerminal,
  hint: (state: ExplodingKittensQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ExplodingKittensQuizGame,
};
