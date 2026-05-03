import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BadeucyPokerState, BadeucyPokerAction, BadeucyPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BadeucyPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BadeucyPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const badeucyPokerPlugin: GamePlugin<BadeucyPokerState, BadeucyPokerAction, typeof settings> = {
  id:"badeucy-poker", title:"Badeucy Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Badeucy: deal five cards, lowball-style scoring with mixed Badugi-2-7 logic.",
  howToPlay:"Badeucy Solo is a hybrid lowball game that mixes 2-7 lowball with Badugi (four-suit, four-rank low). Press Deal to receive five cards from a 52-card deck.\n\nIn real Badeucy, you make your best 2-7 lowball hand AND your best Badugi from the cards. This solo simplifies to scoring the 2-7 portion: lowest no-pair hand wins.\n\nScoring inverted: High Card 100, Pair 60, Two Pair 40, Three of a Kind 25, Straight 10, Flush 5, Full House 2, Four of a Kind 1, Straight Flush 0.\n\nEight rounds total. Because you're scoring lowball, every paired card is bad news — and the more low cards (2-7) you receive, the better your point haul. Press Next between rounds. The variance is high; one pair-free round followed by one quads round can swing you wildly!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BadeucyPokerSettings),
  reducer,isTerminal,  hint: (state: BadeucyPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-badeucy-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-badeucy-poker-next"]', pulses: 3 };
    return null;
  },
  component:BadeucyPokerGame,
};
