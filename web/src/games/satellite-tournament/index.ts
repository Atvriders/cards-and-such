import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SatelliteTournamentState, SatelliteTournamentAction, SatelliteTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SatelliteTournamentGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SatelliteTournamentGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const satelliteTournamentPlugin: GamePlugin<SatelliteTournamentState, SatelliteTournamentAction, typeof settings> = {
  id:"satellite-tournament", title:"Satellite Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo satellite poker; scoring structure rewards survival.",
  howToPlay:"Satellite Tournament Solo simulates satellite events where the prize is entry into a larger tournament rather than cash. Press Deal each round to receive seven cards and the engine evaluates the best five-card hand from your draw.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — eight satellite stages to clear.\n\nSatellite strategy is unique: ICM warps the math because every qualifier seat is identical and survival matters more than chip accumulation. Folding monsters near the bubble can be correct. Here every round adds to your aggregate strength — you're stacking equity rather than busting. Press Next to chase qualifier-tier scores!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SatelliteTournamentSettings),
  reducer, isTerminal,   hint: (state: SatelliteTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-satellite-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-satellite-tournament-next"]', pulses: 3 };
    return null;
  },
  component:SatelliteTournamentGame,
};
