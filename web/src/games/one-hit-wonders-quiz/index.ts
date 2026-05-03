import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OneHitWondersQuizState, OneHitWondersQuizAction, OneHitWondersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OneHitWondersQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OneHitWondersQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const oneHitWondersQuizPlugin: GamePlugin<OneHitWondersQuizState, OneHitWondersQuizAction, typeof settings> = {
  id:"one-hit-wonders-quiz", title:"One-Hit Wonders Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of pop's famous one-hit wonders across decades.",
  howToPlay:"One-Hit Wonders Quiz celebrates the artists who hit it big with one massive song and then... well, faded. From 'Macarena' by Los del Río to 'Take On Me' by a-ha to 'Tubthumping' by Chumbawamba, these songs defined a moment but the artists rarely repeated the trick.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Some of these artists released albums of unappreciated work, but the world only remembers the smash. Will you get them all?",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OneHitWondersQuizSettings),
  reducer,isTerminal,
  hint: (state: OneHitWondersQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:OneHitWondersQuizGame,
};
