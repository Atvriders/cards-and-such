import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChicagoLowPokerState, ChicagoLowPokerAction, ChicagoLowPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChicagoLowPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChicagoLowPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chicagoLowPokerPlugin: GamePlugin<ChicagoLowPokerState, ChicagoLowPokerAction, typeof settings> = {
  id:"chicago-low-poker", title:"Chicago (Low)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Chicago Low: 7-Stud-style deal where the lowest spade in the hole would normally win half the pot.",
  howToPlay:"Chicago Low is a 7-Card Stud side-pot game where the lowest spade dealt to a player's hole splits the pot with the best high hand. This solo edition trims away the side-pot logic and lets you focus on hand-strength scoring — though you can still note the deuce or three of spades when it shows up and remember it would have been a winner.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer scans every five-card subset and selects the strongest poker hand: High Card 0, Pair 10, Two Pair 30, Trips 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. Treat each deal as a fresh hand at the felt; the seven-card pool means frequent two-pair and a healthy chance of straights and flushes. Press Next after each round and chase the highest cumulative total over the full Chicago-Low session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChicagoLowPokerSettings),
  reducer,isTerminal,  hint: (state: ChicagoLowPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-chicago-low-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-chicago-low-poker-next"]', pulses: 3 };
    return null;
  },
  component:ChicagoLowPokerGame,
};
