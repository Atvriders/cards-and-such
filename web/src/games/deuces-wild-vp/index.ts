import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeucesWildVpState, DeucesWildVpAction, DeucesWildVpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DeucesWildVpGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DeucesWildVpGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const deucesWildVpPlugin: GamePlugin<DeucesWildVpState, DeucesWildVpAction, typeof settings> = {
  id:"deuces-wild-vp", title:"Deuces Wild Video Poker Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo deuces-wild video poker; all twos act as wild cards.",
  howToPlay:"Deuces Wild Video Poker Solo simulates the popular VP variant where every 2 is a wild card. Press Deal each round to receive five cards and the engine grades the best five-card poker hand allowing deuces to substitute for any rank or suit.\n\nHand values with wilds: High Card 0, Pair 5 (no pay below 3-of-a-kind in real VP but eased here), Three of a Kind 30, Straight 50, Flush 60, Full House 70, Four of a Kind 90, Straight Flush 120, Five of a Kind 150, Wild Royal Flush 200, Natural Royal 250. Ten rounds.\n\nIn real Deuces Wild, the basic strategy is wildly different from Jacks or Better: hold deuces over pairs, chase higher payouts because deuces dominate the math. Here each round samples five cards with full wild substitution. Press Next to chase deuce-fueled high scores!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DeucesWildVpSettings),
  reducer, isTerminal,
  hint: (state: DeucesWildVpState): HintTarget | null => isTerminal(state) ? null : { selector: '[data-testid="hint-target-deuces-wild-vp-primary"]', pulses: 3 },
  component: DeucesWildVpGame,
};
