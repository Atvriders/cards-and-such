import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BadaceyPokerState, BadaceyPokerAction, BadaceyPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BadaceyPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BadaceyPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const badaceyPokerPlugin: GamePlugin<BadaceyPokerState, BadaceyPokerAction, typeof settings> = {
  id:"badacey-poker", title:"Badacey Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Badacey: lowball scoring with Badugi/A-5 hybrid feel.",
  howToPlay:"Badacey Solo is a hybrid lowball — a mix of Badugi and A-5 Triple Draw. Press Deal each round and receive five cards from a 52-card deck. You score by lowball rules with ace-low.\n\nIn live Badacey, you compete on both the Badugi side (best four-suit, four-rank hand) and the A-5 side (lowest hand with ace as lowest). This solo deals you five cards and scores the A-5 side — pair-free is best.\n\nInverted scoring: High Card 100, Pair 60, Two Pair 40, Three of a Kind 25, Straight 10, Flush 5, Full House 2, Four of a Kind 1, Straight Flush 0.\n\nEight rounds. Aces are great here because they play low. The fewer matching ranks, the more points you earn. Press Next between rounds and chase that perfect wheel deal!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BadaceyPokerSettings),
  reducer,isTerminal,  hint: (state: BadaceyPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-badacey-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-badacey-poker-next"]', pulses: 3 };
    return null;
  },
  component:BadaceyPokerGame,
};
