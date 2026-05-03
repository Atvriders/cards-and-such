import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBlackjackState, MiniBlackjackAction, MiniBlackjackSettings } from "./state.js";
import { initialState, reducer, isTerminal, handTotal } from "./state.js";
const MiniBlackjackGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniBlackjackGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniBlackjackPlugin: GamePlugin<MiniBlackjackState, MiniBlackjackAction, typeof settings> = {
  id:"mini-blackjack", title:"Mini Blackjack", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hit or stand to get as close to 21 as possible without busting. 8 rounds.",
  howToPlay:`Mini Blackjack is a stripped-down solo blackjack game with no dealer, just you and the deck. Each round, you start with two cards. Your goal is to reach a hand total as close to 21 as possible without going over.

Card values: 2-10 are face value; J/Q/K = 10; Aces = 11 unless that would bust, then 1. Tap Hit to draw another card or Stand to lock in your total. Going over 21 (busting) gives zero points for that round.

Scoring per round: hit exactly 21 for 30 points; finish at 18-20 for 20 points; finish at 14-17 for 10 points; below 14 (or bust) for 0 points.

There are eight rounds total, each independent. Don't push too greedy — busting is harsh. A run that scores 100+ points is solid; pushing past 150 takes both nerve and a friendly deck. Stand on 18+ and don't tempt fate when sitting on 16!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniBlackjackSettings),
  hint: (state) => {
    if (state.phase === "betting") return { selector: '[data-testid="hint-target-mini-blackjack-deal"]', pulses: 3 };
    if (state.phase === "settle") return { selector: '[data-testid="hint-target-mini-blackjack-next"]', pulses: 3 };
    if (state.phase !== "player") return null;
    const total = handTotal(state.player);
    if (total < 12) return { selector: '[data-testid="hint-target-mini-blackjack-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-mini-blackjack-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mini-blackjack-hit"]', pulses: 3 };
  },
  reducer,isTerminal,component:MiniBlackjackGame,
};
