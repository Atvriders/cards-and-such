import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IronCrossPokerState, IronCrossPokerAction, IronCrossPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IronCrossPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IronCrossPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ironCrossPokerPlugin: GamePlugin<IronCrossPokerState, IronCrossPokerAction, typeof settings> = {
  id:"iron-cross-poker", title:"Iron Cross Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Iron Cross: cross-shaped community board variant. Receive seven cards and score the best five-card poker hand.",
  howToPlay:"Iron Cross uses the same five-community-card cross layout as Criss-Cross, but with a different reveal order — the arms turn over one at a time, building suspense between betting rounds. This solo edition sidesteps the betting and reveals everything at once: deal seven cards, score the best five.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. The reducer evaluates every possible five-card subset and reports the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Trips 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. Pretend the four arms of the cross are different paths to the pot and your seven-card pool lets you peek down all of them at once. Press Next between rounds and stack the biggest possible cumulative total across your Iron Cross session — straight flushes are rare, but a few full houses can carry the night.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IronCrossPokerSettings),
  reducer,isTerminal,  hint: (state: IronCrossPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-iron-cross-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-iron-cross-poker-next"]', pulses: 3 };
    return null;
  },
  component:IronCrossPokerGame,
};
