import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexicanPokerState, MexicanPokerAction, MexicanPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MexicanPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MexicanPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mexicanPokerPlugin: GamePlugin<MexicanPokerState, MexicanPokerAction, typeof settings> = {
  id:"mexican-poker", title:"Mexican Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Mexican Poker: Stud variant with joker theme (joker would normally be wild only for ace, straight, flush). Deal seven cards.",
  howToPlay:"Mexican Poker is a Stud variant played with a 41-card deck (32 cards plus a joker). The joker is a 'bug' wild card that completes only aces, straights, and flushes — a delightfully restrictive twist that keeps high-end hands valuable. This solo trainer keeps the full 52-card deck and skips the joker so you can focus on the deal-and-score loop.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. The seven-card pool means pairs and two-pair are common, with a healthy chance at trips and the occasional straight or flush. Press Next between rounds and stack up the strongest cumulative session score across your Mexican Poker run.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MexicanPokerSettings),
  reducer, isTerminal,   hint: (state: MexicanPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-mexican-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-mexican-poker-next"]', pulses: 3 };
    return null;
  },
  component:MexicanPokerGame,
};
