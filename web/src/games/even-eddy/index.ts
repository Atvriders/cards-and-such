import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EvenEddyState, EvenEddyAction, EvenEddySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EvenEddyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EvenEddyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const evenEddyPlugin: GamePlugin<EvenEddyState, EvenEddyAction, typeof settings> = {
  id:"even-eddy", title:"Even Eddy", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score on even-pip cards (2,4,6,8,10,Q). 12 draws; +20 per even.",
  howToPlay:"Even Eddy is a card-counting mini where you score points whenever you draw a card with an even pip value: 2, 4, 6, 8, 10, or Queen (which counts as 12 in this game). Six ranks are 'even,' which works out to 24 cards out of 52 — about 46.2% of the deck.\n\nYou draw 12 cards. Each even card scores 20 points; odd cards (3, 5, 7, 9, Jack=11, King=13, Ace=1) score zero. Average expected score is around 110 points (5-6 evens per run); the max possible is 240 (twelve straight even cards — extremely unlikely).\n\nThe mechanic is push-button-watch-card-press-next: minimal interaction, maximum suspense. No skill, no strategy, just gentle gambling with friendly cards. A perfect filler when you want a 60-second card flutter without committing to anything bigger.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EvenEddySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-even-eddy-primary"]', pulses: 3 }),component:EvenEddyGame,
};
