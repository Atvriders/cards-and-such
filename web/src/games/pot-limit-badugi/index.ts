import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PotLimitBadugiState, PotLimitBadugiAction, PotLimitBadugiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PotLimitBadugiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PotLimitBadugiGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const potLimitBadugiPlugin: GamePlugin<PotLimitBadugiState, PotLimitBadugiAction, typeof settings> = {
  id:"pot-limit-badugi", title:"Pot-Limit Badugi", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Pot-Limit Badugi: lowball draw game (best hand = four ranks, four suits). Deal five cards and score the best five-card hand.",
  howToPlay:"Badugi is a four-card lowball draw game where the best possible hand has four different ranks and four different suits — A-2-3-4 of all four suits is the nuts. Pot-Limit adds bet sizes capped at the size of the pot. This solo trainer uses standard five-card poker scoring (not Badugi's lowball ranking) so you can experience the deal-and-score loop on a familiar scale.\n\nPress Deal each round to receive five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. In real Pot-Limit Badugi the goal is to chase low rainbow hands — here the standard rankings flip the perspective so pairs are good and rainbow hands are just incidental. Press Next between rounds and stack up the strongest cumulative score across your full session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PotLimitBadugiSettings),
  reducer,isTerminal,component:PotLimitBadugiGame,
  hint: (state: PotLimitBadugiState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-pot-limit-badugi-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-pot-limit-badugi-next"]', pulses: 3 };
    return null;
  },
};
