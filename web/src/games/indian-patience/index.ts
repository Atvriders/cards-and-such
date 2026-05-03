import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IndianPatienceState, IndianPatienceAction, IndianPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IndianPatienceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IndianPatienceGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const indianPatiencePlugin: GamePlugin<IndianPatienceState, IndianPatienceAction, typeof settings> = {
  id:"indian-patience", title:"Indian Patience", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Indian Patience, a two-deck patience laid in 11 columns of 3.",
  howToPlay:"Indian Patience Trivia is a ten-question quiz about Indian Patience, a classic two-deck patience that lays out 11 columns of three cards each. The aim is to build the eight foundations up by suit from Ace through King. The unique build rule on the tableau is to place a card upon another of any suit except its own — making it less restrictive than Klondike but trickier than wide-open patiences. There is no redeal once the stock is exhausted. Each round of this quiz tests rules, mechanics, suit conventions, and history of Indian Patience and similar two-deck games. Tap an answer and Submit; a correct answer earns 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option and lock the round. Press Next to continue. After ten questions, see your final score. Indian Patience offers a deceptive blend of structure and freedom; see how well you know its quirks.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IndianPatienceSettings),
  reducer,isTerminal,component:IndianPatienceGame,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
};
