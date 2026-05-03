import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ManilaPokerState, ManilaPokerAction, ManilaPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ManilaPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ManilaPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const manilaPokerPlugin: GamePlugin<ManilaPokerState, ManilaPokerAction, typeof settings> = {
  id:"manila-poker", title:"Manila Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Manila: community-card poker with stripped 7-high deck (theme). Deal seven cards from full deck and score the best five.",
  howToPlay:"Manila is a community-card poker game popular in Asia and Australia where the deck is stripped of all cards below 7 (32 cards total). The reduced deck inverts hand rankings: a flush beats a full house, since flushes are now harder to make. This solo trainer keeps the full 52-card deck for variety, but deals seven cards each round so you can score the best five-card hand.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest hand: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. We use the standard rankings here, not Manila's flush-over-boat order.\n\nYou play eight independent rounds. Imagine every low card you see (2 through 6) as bonus material that wouldn't even be in a real Manila deck. Press Next between rounds and stack up the strongest possible cumulative score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ManilaPokerSettings),
  reducer,isTerminal,component:ManilaPokerGame,
  hint: (state: ManilaPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-manila-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-manila-poker-next"]', pulses: 3 };
    return null;
  },
};
