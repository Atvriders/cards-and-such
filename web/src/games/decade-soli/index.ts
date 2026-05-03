import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DecadeSoliState, DecadeSoliAction, DecadeSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DecadeSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DecadeSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const decadeSoliPlugin: GamePlugin<DecadeSoliState, DecadeSoliAction, typeof settings> = {
  id:"decade-soli", title:"Decade", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Decade, a discard-by-tens patience.",
  howToPlay:"Decade Trivia is a ten-question quiz about Decade, a small patience whose object is to discard cards in groups whose pip values total ten or any multiple of ten. The deal lays out cards from a standard 52-card deck in a row, and the player removes adjacent cards summing to ten or a multiple thereof. Face cards count as ten apiece (or are paired together as twenty), and the player keeps removing groups until they cannot proceed. Decade is a quick fortune-telling style patience often used as a between-game distraction. Each question tests rules and mechanics of Decade, what counts as removable, and pip values. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the answer. Press Next to continue. After ten questions your final score is shown. Decade is a fast tally-based patience.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DecadeSoliSettings),
  reducer,isTerminal,component:DecadeSoliGame,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
};
