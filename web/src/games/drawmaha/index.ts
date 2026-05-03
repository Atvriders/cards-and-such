import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrawmahaPokerState, DrawmahaPokerAction, DrawmahaPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DrawmahaPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DrawmahaPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const drawmahaPokerPlugin: GamePlugin<DrawmahaPokerState, DrawmahaPokerAction, typeof settings> = {
  id:"drawmaha", title:"Drawmaha", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Drawmaha: Omaha Hi variant with a draw round after the flop. Deal seven cards and score the best five-card hand.",
  howToPlay:"Drawmaha is a hybrid that bolts a draw round onto Omaha Hi — players are dealt their four hole cards, see the flop, then exchange any number of hole cards before the turn and river arrive. The high hand wins the pot at showdown. This solo trainer skips the draw mechanics and just deals seven cards, scoring the best five.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. In real Drawmaha the post-flop draw lets you swap weak hole cards for fresh shots at the nuts — here every deal is a single shot, but the seven-card pool already gives you plenty to work with. Press Next between rounds and chase the strongest cumulative session score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DrawmahaPokerSettings),
  reducer,isTerminal,  hint: (state: DrawmahaPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-drawmaha-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-drawmaha-next"]', pulses: 3 };
    return null;
  },
  component:DrawmahaPokerGame,
};
