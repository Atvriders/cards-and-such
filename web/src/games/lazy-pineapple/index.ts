import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LazyPineappleState, LazyPineappleAction, LazyPineappleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LazyPineappleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LazyPineappleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lazyPineapplePlugin: GamePlugin<LazyPineappleState, LazyPineappleAction, typeof settings> = {
  id:"lazy-pineapple", title:"Lazy Pineapple (Tahoe) Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Lazy Pineapple Tahoe: keep all three hole cards through showdown.",
  howToPlay:"Lazy Pineapple (Tahoe) Solo is the keep-all-three-hole-cards Pineapple variant. In live Tahoe, players receive three hole cards and never discard — they simply use the best two of three at showdown. Here, press Deal to receive eight cards (three hole + five community) and the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nBecause you keep all three hole cards, your effective playable combinations are wider — leading to more big hands.\n\nSeven rounds. The eight-card pool produces Full Houses and Quads more often than seven-card games. Press Next between rounds and try multiple seeds to see your range.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LazyPineappleSettings),
  reducer, isTerminal,   hint: (state: LazyPineappleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-lazy-pineapple-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-lazy-pineapple-next"]', pulses: 3 };
    return null;
  },
  component:LazyPineappleGame,
};
