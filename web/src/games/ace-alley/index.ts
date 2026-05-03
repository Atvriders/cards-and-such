import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AceAlleyState, AceAlleyAction, AceAlleySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AceAlleyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AceAlleyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aceAlleyPlugin: GamePlugin<AceAlleyState, AceAlleyAction, typeof settings> = {
  id:"ace-alley", title:"Ace Alley", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find aces across 8 single-card draws. +100 per ace.",
  howToPlay:`Ace Alley is a tight, one-card-at-a-time pursuit of aces. You'll make 8 draws from a freshly shuffled deck (one card per draw, drawn fairly with replacement-style randomness). Every Ace you pull scores 100 points; every other card scores nothing.

The probability of any given card being an Ace is 4/52 (about 7.7%). Across 8 draws, you can expect to find roughly 0.6 aces on average, or about 60 points. Hitting two aces in 8 draws is a very strong run; three or more is exceptional and you should buy a lottery ticket.

Press Draw to flip a card, then Next to move to the following draw. The game shows your running ace count and total points. Don't expect dazzling scores most runs — the joy here is the small thrill of the flip and the rare moment when the Ace appears in the alley!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AceAlleySettings),
  reducer,isTerminal, hint: (state: AceAlleyState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-ace-alley-primary"]', pulses: 3 } : null),component:AceAlleyGame,
};
