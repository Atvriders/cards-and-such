import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperHoldemState, SuperHoldemAction, SuperHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SuperHoldemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SuperHoldemGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const superHoldemPlugin: GamePlugin<SuperHoldemState, SuperHoldemAction, typeof settings> = {
  id:"super-holdem", title:"Super Hold'em Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Super Hold'em: three hole + five community, best five-card poker hand scored.",
  howToPlay:"Super Hold'em Solo simulates the lesser-known three-hole-card Hold'em variant. Press Deal each round and receive eight cards (three hole + five community). The best five-card poker hand is scored automatically.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn real Super Hold'em, players use any TWO of their three hole cards plus the five-card community board, giving more flexibility than vanilla Hold'em. The eight-card pool here reflects that wider option set.\n\nSeven rounds. Expect averages between standard Hold'em and 5-Card Omaha. Press Next between rounds and watch the variance — Super Hold'em produces many premium hands per session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SuperHoldemSettings),
  reducer, isTerminal,   hint: (state: SuperHoldemState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-super-holdem-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-super-holdem-next"]', pulses: 3 };
    return null;
  },
  component:SuperHoldemGame,
};
