import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ProgressiveKnockoutState, ProgressiveKnockoutAction, ProgressiveKnockoutSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ProgressiveKnockoutGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ProgressiveKnockoutGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const progressiveKnockoutPlugin: GamePlugin<ProgressiveKnockoutState, ProgressiveKnockoutAction, typeof settings> = {
  id:"progressive-knockout", title:"Progressive Knockout Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo poker simulating PKO bounty progression where bounties grow each round.",
  howToPlay:"Progressive Knockout (PKO) Solo simulates the bounty format where each elimination splits half the cash to your stack and half remains attached. Press Deal to receive seven cards (two hole + five community) and the engine selects the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds total — each represents a knockout level where bounty stakes climb.\n\nIn live PKO play, knocking out an opponent with a large bounty becomes increasingly valuable as the field thins. Big stack pressure plus bounty equity forces aggression at final tables. Here, every premium combo banks cumulative bounty score. Press Next to chase the biggest progressive haul!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ProgressiveKnockoutSettings),
  reducer, isTerminal,   hint: (state: ProgressiveKnockoutState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-progressive-knockout-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-progressive-knockout-next"]', pulses: 3 };
    return null;
  },
  component:ProgressiveKnockoutGame,
};
