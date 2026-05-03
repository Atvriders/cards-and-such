import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BasicRummyState, BasicRummyAction, BasicRummySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BasicRummyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BasicRummyGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const basicRummyPlugin: GamePlugin<BasicRummyState, BasicRummyAction, typeof settings> = {
  id:"basic-rummy", title:"Basic Rummy", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Basic Rummy, the foundation of the rummy family.",
  howToPlay:"Basic Rummy Trivia is a ten-question quiz about Basic Rummy, the foundation of the rummy family of card games. Played by 2-6 players with a standard 52-card deck (each player dealt 7-10 cards depending on player count), the goal is to form sets (three or more of a kind) and runs (three or more in sequence of one suit) and 'go out' by melding all your cards. On each turn a player draws (from stock or discard) and discards. The first player to lay down all their cards wins the round. Each question tests rules, scoring, sets/runs, and the history of Basic Rummy. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Rummy is one of the most-played card families in the world.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BasicRummySettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-basic-rummy-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-basic-rummy-submit"]', pulses: 3 };
    return null;
  },component:BasicRummyGame,
};
