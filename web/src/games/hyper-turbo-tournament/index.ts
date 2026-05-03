import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HyperTurboTournamentState, HyperTurboTournamentAction, HyperTurboTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HyperTurboTournamentGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HyperTurboTournamentGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hyperTurboTournamentPlugin: GamePlugin<HyperTurboTournamentState, HyperTurboTournamentAction, typeof settings> = {
  id:"hyper-turbo-tournament", title:"Hyper-Turbo Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo hyper-turbo poker; ultra-fast simulated blinds.",
  howToPlay:"Hyper-Turbo Tournament Solo models the extreme blind structure where levels last only three minutes. Press Deal to receive seven cards (two hole + five community) and the engine evaluates the best five-card hand among all 21 combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds total — at hyper speed.\n\nHyper-turbo play is essentially shove-fold from level one: starting stacks are tiny relative to blinds. Pre-flop equity is everything. Here, eight quick deals decide your final score; there is no time to slow-play anything. Press Next immediately after seeing your hand and rip toward the highest aggregate score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HyperTurboTournamentSettings),
  reducer, isTerminal,   hint: (state: HyperTurboTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-hyper-turbo-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-hyper-turbo-tournament-next"]', pulses: 3 };
    return null;
  },
  component:HyperTurboTournamentGame,
};
