import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleFlopHoldemState, DoubleFlopHoldemAction, DoubleFlopHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DoubleFlopHoldemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DoubleFlopHoldemGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleFlopHoldemPlugin: GamePlugin<DoubleFlopHoldemState, DoubleFlopHoldemAction, typeof settings> = {
  id:"double-flop-holdem", title:"Double Flop Hold'em Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Double Flop Hold'em: nine cards dealt simulating two boards; best high hand scored.",
  howToPlay:"Double Flop Hold'em Solo simulates the wild two-board Hold'em variant. In live Double Flop, two complete community boards are dealt simultaneously and the pot is split between best hand on each. Press Deal each round to receive nine cards (two hole + seven community spread across two simulated boards); the best five-card poker hand is scored as the combined high.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nWith two boards in play, big hands appear far more frequently than single-board Hold'em.\n\nSix rounds. The nine-card pool means Full Houses are nearly automatic on big-card streets. Press Next between rounds and chase Quads.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DoubleFlopHoldemSettings),
  reducer,isTerminal,  hint: (state: DoubleFlopHoldemState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-double-flop-holdem-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-double-flop-holdem-next"]', pulses: 3 };
    return null;
  },
  component:DoubleFlopHoldemGame,
};
