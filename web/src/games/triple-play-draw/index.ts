import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriplePlayDrawState, TriplePlayDrawAction, TriplePlayDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TriplePlayDrawGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TriplePlayDrawGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const triplePlayDrawPlugin: GamePlugin<TriplePlayDrawState, TriplePlayDrawAction, typeof settings> = {
  id:"triple-play-draw", title:"Triple Play Draw Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo triple-play video poker; three simultaneous hands per draw.",
  howToPlay:"Triple Play Draw Poker Solo simulates the VP format where you play three simultaneous draw hands from the same five-card initial deal. Press Deal to receive five cards; the engine scores three independent draws and sums the result.\n\nEach draw is scored Jacks-or-Better style: Pair (jacks+) 5, Two Pair 10, Three of a Kind 15, Straight 20, Flush 30, Full House 45, Four of a Kind 125, Straight Flush 250, Royal Flush 800. Each round simulates three of these. Eight rounds total.\n\nIn live Triple Play, after the initial five-card deal, the held cards are duplicated across three pay lines and three independent draws are dealt. Strategy is nearly identical to single-line VP except that the EV of holding ANY winning hand is tripled. Here every round triples the score by sampling three draws. Press Next to chase triple-line jackpots!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TriplePlayDrawSettings),
  reducer, isTerminal,   hint: (state: TriplePlayDrawState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-triple-play-draw-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-triple-play-draw-next"]', pulses: 3 };
    return null;
  },
  component:TriplePlayDrawGame,
};
