import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaFiveCardHiLoState, OmahaFiveCardHiLoAction, OmahaFiveCardHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OmahaFiveCardHiLoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OmahaFiveCardHiLoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const omahaFiveCardHiLoPlugin: GamePlugin<OmahaFiveCardHiLoState, OmahaFiveCardHiLoAction, typeof settings> = {
  id:"omaha-five-card-hi-lo", title:"Omaha 5-Card Hi-Lo Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo five-card Omaha Hi-Lo: ten cards, best high-hand poker scoring.",
  howToPlay:"Omaha 5-Card Hi-Lo Solo is the maximum-action Omaha variant simplified to a solo dealer. Press Deal each round to draw ten cards from a 52-card deck (five hole + five community) and the best five-card high hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nLive 5-Card Omaha Hi-Lo splits pots between best high and qualifying low (8-or-Better). This solo emphasises the high half but the deal flexibility means most rounds give you something premium.\n\nSix rounds. Look for Quads and Straight Flushes far more often than in five- or seven-card games. Press Next between rounds and try to lock in two big hands per session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OmahaFiveCardHiLoSettings),
  reducer, isTerminal,   hint: (state: OmahaFiveCardHiLoState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-omaha-five-card-hi-lo-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-omaha-five-card-hi-lo-next"]', pulses: 3 };
    return null;
  },
  component:OmahaFiveCardHiLoGame,
};
