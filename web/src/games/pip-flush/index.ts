import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipFlushState, PipFlushAction, PipFlushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PipFlushGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PipFlushGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipFlushPlugin: GamePlugin<PipFlushState, PipFlushAction, typeof settings> = {
  id:"pip-flush", title:"Pip Flush", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each round chase a flush in five dealt cards. Larger same-suit groups score, five is jackpot.",
  howToPlay:`Pip Flush is a quick five-card flush-chasing card mini. Each round, five cards are dealt face-up. Look at how many cards share the largest single suit. That biggest same-suit group earns 5 points per card.

A typical hand of five cards usually shows two or three of one suit, scoring 10 or 15. Four of a suit (a near-flush) is a strong 20-point round. If all five cards happen to be in the same suit — a true Flush — you earn the base 25 plus a 60-point jackpot bonus, for a round total of 85 points.

There are 8 rounds. There's no in-round choice; the cards fall as they will. The probability of a five-card flush in a freshly shuffled deck is about 1 in 500, so flushes are rare and exciting events. Average expected scores hover near 110-130; a hot run with a flush or two can push past 250.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipFlushSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-pip-flush-primary"]', pulses: 3 }),component:PipFlushGame,
};
