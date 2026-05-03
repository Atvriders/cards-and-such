import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RoyalHoldemState, RoyalHoldemAction, RoyalHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RoyalHoldemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RoyalHoldemGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const royalHoldemPlugin: GamePlugin<RoyalHoldemState, RoyalHoldemAction, typeof settings> = {
  id:"royal-holdem", title:"Royal Hold'em", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Royal Hold'em: Hold'em with only tens through aces (20-card deck themed). Deal seven cards from a 52-deck for fun.",
  howToPlay:"Royal Hold'em strips a deck down to just the tens, jacks, queens, kings, and aces — twenty cards total — and plays Hold'em from there. Premium hands fly out: full houses, quads, and even straight flushes are commonplace. This solo trainer keeps the standard 52-card deck for variety, but deals seven cards each round so you can score the best five.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest hand: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. In real Royal Hold'em the smallest hand you'd see is often a pair of tens; here the full deck gives more variety but still rewards you when face cards cluster. Press Next between rounds and try to stack the highest cumulative score across your full Royal Hold'em session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RoyalHoldemSettings),
  reducer,isTerminal,component:RoyalHoldemGame,
  hint: (state: RoyalHoldemState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-royal-holdem-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-royal-holdem-next"]', pulses: 3 };
    return null;
  },
};
