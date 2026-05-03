import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KansasCityLowballState, KansasCityLowballAction, KansasCityLowballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KansasCityLowballGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KansasCityLowballGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kansasCityLowballPlugin: GamePlugin<KansasCityLowballState, KansasCityLowballAction, typeof settings> = {
  id:"kansas-city-lowball", title:"Kansas City Lowball Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo single-draw 2-7 lowball; ace always plays high.",
  howToPlay:"Kansas City Lowball Solo simulates the 2-7 single-draw lowball format where the lowest hand wins and the ace always plays high. Press Deal each round to receive five cards and the engine scores the lowness of your hand.\n\nLowball scoring: the engine picks the BEST five-card hand minimizing pair count and rank totals. Lowest possible hand 2-3-4-5-7 unsuited scores top points. Hand values invert: stronger high-poker hands score lower. There are nine rounds — nine fresh lowball deals.\n\nKansas City lowball is the original lowball: ace high, and 2-3-4-5-7 unsuited is the nuts. Straights and flushes count as high hands and hurt your low. Here, the score reflects how 'low' your draw came out — premium lows accumulate big numbers. Press Next to chase the best low across nine rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KansasCityLowballSettings),
  reducer, isTerminal,   hint: (state: KansasCityLowballState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-kansas-city-lowball-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-kansas-city-lowball-next"]', pulses: 3 };
    return null;
  },
  component:KansasCityLowballGame,
};
