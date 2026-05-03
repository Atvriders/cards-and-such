import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StepTournamentState, StepTournamentAction, StepTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StepTournamentGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StepTournamentGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const stepTournamentPlugin: GamePlugin<StepTournamentState, StepTournamentAction, typeof settings> = {
  id:"step-tournament", title:"Step Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo step-satellite poker; advance through nine escalating tiers.",
  howToPlay:"Step Tournament Solo simulates the multi-level satellite system where winners at one step advance to the next. Press Deal each round to receive seven cards and the engine picks the best five-card hand from the 21 possible combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds correspond to nine escalating step levels.\n\nLive step tournaments build a staircase: clear step one, advance to step two, and so on. The reward at the top is the seat to a major event. Here the staircase is your cumulative score — each level higher demands a bigger combo to keep climbing. Press Next to climb from step one to step nine!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StepTournamentSettings),
  reducer, isTerminal,   hint: (state: StepTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-step-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-step-tournament-next"]', pulses: 3 };
    return null;
  },
  component:StepTournamentGame,
};
