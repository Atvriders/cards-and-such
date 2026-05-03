import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraddleGameState, StraddleGameAction, StraddleGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StraddleGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StraddleGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const straddleGamePlugin: GamePlugin<StraddleGameState, StraddleGameAction, typeof settings> = {
  id:"straddle-game", title:"Straddle Game Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo straddle poker; doubled blind structure simulated each round.",
  howToPlay:"Straddle Game Solo simulates cash games where a live straddle is optional or required, doubling the effective blind structure. Press Deal each round to receive seven cards (two hole + five community) and the best five-card poker hand is auto-scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds reflect inflated straddle pots.\n\nLive straddle play creates massive pots with shorter effective stack-to-pot ratios. Hands like suited connectors lose value while premium pairs dominate because of the inflated stakes. Here every deal feels like a straddled pot — high variance, premium-driven. Press Next to navigate nine swingy straddle rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StraddleGameSettings),
  reducer, isTerminal,   hint: (state: StraddleGameState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-straddle-game-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-straddle-game-next"]', pulses: 3 };
    return null;
  },
  component:StraddleGameGame,
};
