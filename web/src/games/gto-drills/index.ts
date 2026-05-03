import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GtoDrillsState, GtoDrillsAction, GtoDrillsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GtoDrillsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GtoDrillsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const gtoDrillsPlugin: GamePlugin<GtoDrillsState, GtoDrillsAction, typeof settings> = {
  id:"gto-drills", title:"GTO Drills Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo poker training drills; ten focused spots evaluating hand strength.",
  howToPlay:"GTO Drills Solo simulates spot-practice training where solver-derived ranges drive every decision. Press Deal each round to receive seven cards and the engine evaluates the best five-card hand from your draw — a microcosm of equity calculations in real solver work.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Ten rounds simulate ten spot drills.\n\nReal GTO drills rep specific spots — like 4-bet defense from the big blind versus a button raise — until ranges are memorized. The math is hard but learnable. Here, each deal is a quick equity rep, training you to recognize hand strength quickly. Press Next to drill through ten spots and clock your aggregate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GtoDrillsSettings),
  reducer, isTerminal,   hint: (state: GtoDrillsState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-gto-drills-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-gto-drills-next"]', pulses: 3 };
    return null;
  },
  component:GtoDrillsGame,
};
