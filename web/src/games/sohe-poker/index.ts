import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SohePokerState, SohePokerAction, SohePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SohePokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SohePokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sohePokerPlugin: GamePlugin<SohePokerState, SohePokerAction, typeof settings> = {
  id:"sohe-poker", title:"Sohe Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo SOHE; Stud/Omaha/Hold'em hybrid in rotating rounds.",
  howToPlay:"SOHE Solo simulates the three-game Stud/Omaha/Hold'em mixed format played in rotating rounds. Press Deal each round to receive seven cards and the engine evaluates the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — three games rotating.\n\nLive SOHE forces players to switch styles every orbit: Stud is heads-up reading, Omaha is range-heavy, Hold'em is balanced. Each game has different optimal preflop play. Here every round is a seven-card draw graded by best-five — a unified abstraction across all three games. Press Next to grind eight SOHE rotations and rack up your hybrid total!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SohePokerSettings),
  reducer,isTerminal,component:SohePokerGame,
  hint: (state: SohePokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-sohe-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-sohe-poker-next"]', pulses: 3 };
    return null;
  },
};
