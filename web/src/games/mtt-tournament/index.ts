import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MttTournamentState, MttTournamentAction, MttTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MttTournamentGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MttTournamentGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mttTournamentPlugin: GamePlugin<MttTournamentState, MttTournamentAction, typeof settings> = {
  id:"mtt-tournament", title:"MTT Multi-Table Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo multi-table tournament poker; ten rounds simulating escalating blinds.",
  howToPlay:"MTT Multi-Table Tournament Solo simulates the bread-and-butter format where escalating blinds whittle a huge field down to one champion. Press Deal each round to receive seven cards and the engine picks the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Ten rounds model the early-to-final-table arc.\n\nMTT strategy evolves through stages: deep-stack play early, ICM warping near the bubble, then aggressive jamming late. Field strength varies dramatically from level one to level twenty. Here each round represents a different stage of an MTT. Press Next after each deal to advance from satellite-grind levels to final-table glory!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MttTournamentSettings),
  reducer, isTerminal,   hint: (state: MttTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-mtt-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-mtt-tournament-next"]', pulses: 3 };
    return null;
  },
  component:MttTournamentGame,
};
