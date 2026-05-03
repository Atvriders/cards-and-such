import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlushFiveState, FlushFiveAction, FlushFiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FlushFiveGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FlushFiveGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const flushFivePlugin: GamePlugin<FlushFiveState, FlushFiveAction, typeof settings> = {
  id:"flush-five", title:"Flush Five", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal 5 cards each round; score by your longest matching-suit chain.",
  howToPlay:`Flush Five is a tiny card-dealing scoring game. Each round, five cards are dealt face-up. Your score is based on your longest single-suit chain in the hand: five-of-a-suit (a true flush) is 60 points, four-of-a-suit is 30, three-of-a-suit is 10, and anything less scores zero.

You play 8 rounds. There's no choice — just hit Deal, see what comes up, and tally points. Pure flushes are rare (the odds of dealing all five cards in the same suit from a fresh deck are roughly 0.2%), but four-of-a-suit hands turn up a few times in a typical game.

Average expected score lands around 20-40 points across 8 rounds, with lucky runs reaching 100+ when a four-of-a-suit or pair of three-of-a-suit hands lands. Watch the suits as the cards drop and savor those flush moments — they're rare, but oh so satisfying.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FlushFiveSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-flush-five-primary"]', pulses: 3 }),component:FlushFiveGame,
};
