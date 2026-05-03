import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TheStarSoliState, TheStarSoliAction, TheStarSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TheStarSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TheStarSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const theStarSoliPlugin: GamePlugin<TheStarSoliState, TheStarSoliAction, typeof settings> = {
  id:"the-star-soli", title:"The Star", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about The Star, a fortune-telling style patience.",
  howToPlay:"The Star Trivia is a ten-question quiz about The Star, a fortune-telling solitaire dealt in a star-shape with eight reserve groups radiating outward. Players group cards by rank or matched pairs, depending on the variant. The classic version uses a single 52-card deck and ranks unburdened by suit. The Star is part of a family of fortune-telling oddity patiences popular in Victorian-era casual play. Each question tests rules, mechanics, layout, and history of The Star. Tap an answer and Submit; a correct answer earns 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option and lock the round. Press Next to continue. After ten questions, your final score is displayed. The Star is more about pattern, presentation, and play than calculation; its star-shaped tableau is its signature charm.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TheStarSoliSettings),
  reducer,isTerminal,component:TheStarSoliGame,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
};
