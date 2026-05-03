import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StateCapitalsMiniState, StateCapitalsMiniAction, StateCapitalsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StateCapitalsMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StateCapitalsMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const stateCapitalsMiniPlugin: GamePlugin<StateCapitalsMiniState, StateCapitalsMiniAction, typeof settings> = {
  id:"state-capitals-mini", title:"US State Capitals Mini", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Quick US state capitals quiz. 10 or 20 questions, 15s each.",
  howToPlay:"State Capitals Mini is a fast US-geography quiz on the 50 state capitals. Each question shows you a state and four candidate capital cities; tap the correct one and hit Submit.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers (or letting the timer expire) score zero. The right answer is always revealed at the end of the round.\n\nSome capitals are well-known (Sacramento, Tallahassee, Albany), but many trip people up \u2014 the largest city is rarely the capital. New York is Albany (not NYC). California is Sacramento (not LA). Pennsylvania is Harrisburg (not Philadelphia). Florida is Tallahassee (not Miami). Even Hawaii's capital is in Oahu (Honolulu), not the Big Island.\n\nChoose 10 or 20 questions in Settings. With 24 capitals in the pool, every game shuffles a fresh subset, so you'll see a different mix each run. Aim for a perfect score and prove you know your American geography!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StateCapitalsMiniSettings),
  reducer,isTerminal,hint: (state: StateCapitalsMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-state-capitals-mini-answer-0"]', pulses: 3 } : null, component:StateCapitalsMiniGame,
};
