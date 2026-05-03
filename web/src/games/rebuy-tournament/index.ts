import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RebuyTournamentState, RebuyTournamentAction, RebuyTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RebuyTournamentGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RebuyTournamentGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rebuyTournamentPlugin: GamePlugin<RebuyTournamentState, RebuyTournamentAction, typeof settings> = {
  id:"rebuy-tournament", title:"Rebuy Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo rebuy-style poker rounds simulating early-level aggression.",
  howToPlay:"Rebuy Tournament Solo emulates early-level rebuy poker where players buy back in if they bust within the first few levels. Press Deal each round to receive seven cards and the engine picks the best five-card poker hand combination.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds simulate nine rebuy intervals.\n\nLive rebuy play encourages aggression: getting it in light is correct because you can simply rebuy. The optimal strategy treats early levels almost like cash. Here the analog is volume — nine rounds means nine chances to land that monster combo and inflate the final number. Press Next after each deal to rebuy your way to a top score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RebuyTournamentSettings),
  reducer,isTerminal,component:RebuyTournamentGame,
  hint: (state: RebuyTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-rebuy-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-rebuy-tournament-next"]', pulses: 3 };
    return null;
  },
};
