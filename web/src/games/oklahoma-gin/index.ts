import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OklahomaGinState, OklahomaGinAction, OklahomaGinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OklahomaGinGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OklahomaGinGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const oklahomaGinPlugin: GamePlugin<OklahomaGinState, OklahomaGinAction, typeof settings> = {
  id:"oklahoma-gin", title:"Oklahoma Gin", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Oklahoma Gin, a Gin Rummy variant where the upcard caps knock value.",
  howToPlay:"Oklahoma Gin Trivia is a ten-question quiz about Oklahoma Gin, a popular Gin Rummy variant in which the value of the first upcard determines the maximum allowable knock count for that hand. If the upcard is a Spade the score is doubled, and certain ranks (like an Ace) require a forced gin (knock with zero deadwood). Played by two players with a standard 52-card deck, each receives 10 cards. The objective is to form sets and runs, then knock when your unmatched deadwood is at or below the limit set by the upcard. Each question tests rules, scoring, knocking limits, and strategy of Oklahoma Gin. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Oklahoma Gin adds clever variability to standard Gin Rummy through its dynamic knock-limit rule.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OklahomaGinSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-oklahoma-gin-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-oklahoma-gin-submit"]', pulses: 3 };
    return null;
  },component:OklahomaGinGame,
};
