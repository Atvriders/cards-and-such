import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RotoPokerState, RotoPokerAction, RotoPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RotoPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RotoPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rotoPokerPlugin: GamePlugin<RotoPokerState, RotoPokerAction, typeof settings> = {
  id:"roto-poker", title:"ROTO Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo ROTO poker; Razz-Omaha rotating-round hybrid.",
  howToPlay:"ROTO Solo simulates the Razz-Omaha hybrid that rotates rules each round between low-only and high-only formats. Press Deal each round to receive six cards and the engine evaluates the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — alternating Razz and Omaha rules abstracted to high-only here.\n\nLive ROTO play rotates Razz hands (low-only) and Omaha hands (four hole, must use two) in fixed orbit. Strategy completely flips between rounds: tight in Omaha, loose-aggressive in Razz. Here every round is a six-card draw graded by best-five. Press Next to switch gears across eight ROTO rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RotoPokerSettings),
  reducer, isTerminal,   hint: (state: RotoPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-roto-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-roto-poker-next"]', pulses: 3 };
    return null;
  },
  component:RotoPokerGame,
};
