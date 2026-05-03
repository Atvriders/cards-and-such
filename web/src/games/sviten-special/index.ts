import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SvitenSpecialState, SvitenSpecialAction, SvitenSpecialSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SvitenSpecialGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SvitenSpecialGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const svitenSpecialPlugin: GamePlugin<SvitenSpecialState, SvitenSpecialAction, typeof settings> = {
  id:"sviten-special", title:"Sviten Special Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Sviten Special: Swedish 5-Card Draw + Badugi mix, best five-card high scored.",
  howToPlay:"Sviten Special Solo translates the Swedish split game into a quick deal. In real Sviten, you make your best 5-Card Draw hand AND your best Badugi (four-suit, four-rank low) from your cards.\n\nPress Deal each round to receive five cards from a 52-card deck. The 5-Card Draw side is scored using standard poker rankings: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nEight rounds. In live Sviten, the second draw at Badugi adds an extra strategic layer. Here we focus on the more familiar high-hand half. Press Next between rounds and play multiple seeds to compare your average.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SvitenSpecialSettings),
  reducer, isTerminal,   hint: (state: SvitenSpecialState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-sviten-special-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-sviten-special-next"]', pulses: 3 };
    return null;
  },
  component:SvitenSpecialGame,
};
