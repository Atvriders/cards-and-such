import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NineNineState, NineNineAction, NineNineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NineNineGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NineNineGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nineNinePlugin: GamePlugin<NineNineState, NineNineAction, typeof settings> = {
  id:"nine-nine", title:"Nine Nine", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 12 cards. Each Nine you reveal scores +60 points; other cards score a small consolation +5.",
  howToPlay:`Nine Nine is a tiny card-drawing arcade with one goal: collect Nines. Each round, a single random card is dealt face-up. If it's a Nine of any suit, you score a satisfying +60 points. If it's anything else, you still earn a +5 consolation pip — every draw at least sneaks something into your bank.

There are 12 draws per game. Since each suit has exactly one Nine, the probability of drawing a nine on any given pull is roughly 4 in 52, or about 7.7%. Expected value of a perfectly average game is around 60 points (one Nine plus eleven consolations).

Smart play tip: there's no skill, only seed luck. The draws come from a deterministic seeded RNG, so identical seeds always produce identical games. Two or three nines is a great game; four or more is a bragging-rights run!

The interface is simple — press Draw, see the card, then press Next to continue. Watch your nine-counter climb!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NineNineSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-nine-nine-primary"]', pulses: 3 }),component:NineNineGame,
};
