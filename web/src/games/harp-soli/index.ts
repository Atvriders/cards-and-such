import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HarpSoliState, HarpSoliAction, HarpSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HarpSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HarpSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const harpSoliPlugin: GamePlugin<HarpSoliState, HarpSoliAction, typeof settings> = {
  id:"harp-soli", title:"Harp", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Harp, a two-deck Klondike-style patience.",
  howToPlay:"Harp Trivia is a ten-question quiz about Harp, a two-deck Klondike-style patience often considered a doubled version of standard Klondike. The deal sets up nine tableau columns of increasing length — the leftmost holds one card, and the rightmost holds nine — so 45 cards are dealt face-up while the rest form the stock. Eight foundations are built up from Ace to King by suit, and tableau builds go down by alternating color in standard Klondike style. The stock is dealt one card at a time with a single redeal allowed. Each question tests rules, mechanics, history, and tactics of Harp and its sibling two-deck games. Tap an answer and Submit; a correct answer earns 100 points plus 10 per second left on the 15-second timer. Wrong answers reveal the answer and lock the round. After ten questions, see your final score. Harp doubles the fun — and the difficulty — of Klondike.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HarpSoliSettings),
  reducer,isTerminal,component:HarpSoliGame,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
};
