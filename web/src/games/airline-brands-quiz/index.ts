import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AirlineBrandsQuizState, AirlineBrandsQuizAction, AirlineBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AirlineBrandsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AirlineBrandsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const airlineBrandsQuizPlugin: GamePlugin<AirlineBrandsQuizState, AirlineBrandsQuizAction, typeof settings> = {
  id:"airline-brands-quiz", title:"Airline Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Logos, hubs, fleets and the world's great airline brands.",
  howToPlay:"Airline Brands Quiz tests your knowledge of carriers around the world. Questions cover hub airports, country flags, livery colors, founding histories, and the most iconic airline campaigns and tail logos — from Pan Am and TWA's golden age to Emirates, Singapore Airlines, and modern budget disruptors.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Departure gate is open — see if you can earn your wings as a true aviation buff!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AirlineBrandsQuizSettings),
  reducer,isTerminal,
  hint: (state: AirlineBrandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AirlineBrandsQuizGame,
};
