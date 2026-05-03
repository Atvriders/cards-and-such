import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbandonArtichokesQuizState, AbandonArtichokesQuizAction, AbandonArtichokesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbandonArtichokesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbandonArtichokesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const abandonArtichokesQuizPlugin: GamePlugin<AbandonArtichokesQuizState, AbandonArtichokesQuizAction, typeof settings> = {
  id:"abandon-artichokes-quiz", title:"Abandon Artichokes Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Abandon All Artichokes, the deck-purging vegetable card game.",
  howToPlay:"Abandon Artichokes Trivia is a ten-question quiz about the family-weight card game where players race to remove every artichoke card from their deck, the first to reach a hand of zero artichokes winning. Each round you'll be tested on the publisher Gamewright, the deck-purging twist on deck-building, the various vegetable cards that help (broccoli, leek, eggplant, etc.), the simple rules, and recommended ages. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Abandon All Artichokes was one of the breakout family card games of 2020 — see how much trivia about its veggie-purging joy you can muster.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AbandonArtichokesQuizSettings),
  reducer,isTerminal,
  hint: (state: AbandonArtichokesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AbandonArtichokesQuizGame,
};
