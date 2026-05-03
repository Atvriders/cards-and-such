import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeadsUpHoldemCasState, HeadsUpHoldemCasAction, HeadsUpHoldemCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HeadsUpHoldemCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HeadsUpHoldemCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: HeadsUpHoldemCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "deal") return { selector: '[data-testid="hint-target-heads-up-holdem-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-heads-up-holdem-cas-secondary"]', pulses: 3 };
  return null;
};
export const headsUpHoldemCasPlugin: GamePlugin<HeadsUpHoldemCasState, HeadsUpHoldemCasAction, typeof settings> = {
  id:"heads-up-holdem-cas", title:"Heads-Up Texas Hold'em (Casino)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Heads-Up Hold'em Casino: deal seven cards (hole + board) and score the best five-card hand.",
  howToPlay:"Heads-Up Texas Hold'em is a casino-format variant where one player faces the dealer head-to-head with optional bonus side bets on early position. The core poker structure remains the same as Texas Hold'em: two hole cards plus five community cards, best five-card hand decides the pot. This solo trainer skips the betting and bonus structures and focuses on the seven-card deal and hand-strength scoring.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. The seven-card pool keeps the hands generous — pairs and two-pair land regularly, with a sprinkle of straights and flushes. Press Next between rounds and stack up the strongest possible cumulative score in your Heads-Up Hold'em session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HeadsUpHoldemCasSettings),
  reducer,isTerminal,hint: hint, component: HeadsUpHoldemCasGame,
};
