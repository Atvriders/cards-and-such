import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourCardPokerState, FourCardPokerAction, FourCardPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FourCardPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FourCardPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fourCardPokerPlugin: GamePlugin<FourCardPokerState, FourCardPokerAction, typeof settings> = {
  id:"four-card-poker", title:"Four Card Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Four Card Poker: deal five cards and score the best hand (mimicking the deal-five, choose-four casino game).",
  howToPlay:"Four Card Poker is a casino table game where players are dealt five cards and choose their best four-card hand to play against the dealer. Hand rankings adapt slightly — four-of-a-kind is still king, but with only four cards there are no full houses or five-card straights. This solo trainer keeps it simple by dealing five cards and scoring them under the standard five-card poker hand-rank table.\n\nPress Deal each round to receive five random cards. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Imagine each deal as the dealer flipping you five cards and you mentally pick the best four — even though we score the full five-card poker hand, the spirit of the game (chase trips and flushes from a small deal) carries through. Press Next between rounds and stack up your highest possible cumulative session score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FourCardPokerSettings),
  reducer,isTerminal,component:FourCardPokerGame,
  hint: (state: FourCardPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-four-card-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-four-card-poker-next"]', pulses: 3 };
    return null;
  },
};
