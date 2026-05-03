import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourFoursState, FourFoursAction, FourFoursSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FourFoursGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FourFoursGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fourFoursPlugin: GamePlugin<FourFoursState, FourFoursAction, typeof settings> = {
  id:"four-fours", title:"Four Fours", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hunt for the four 4s in the deck. 16 draws; +25 per four.",
  howToPlay:"Four Fours is a card-spotting mini where you draw cards looking for the rank '4' — there are exactly four of them in a 52-card deck. The game runs for 16 draws, and each four you uncover scores 25 points.\n\nProbability-wise, each draw has roughly a 7.7% chance of being a four (4 in 52). Across 16 draws, you can expect about 1.2 fours on average — so a typical run scores 25–50. Lucky runs land 75 or 100 points; an unlikely run of four 4s in sixteen would score the maximum 100 points.\n\nThere's no skill — just press Draw, see the card, press Next. The game's appeal is the tight tension and the small dopamine hit when a four finally pops out. Set yourself a personal best and chase fortune one card at a time.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FourFoursSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-four-fours-primary"]', pulses: 3 }),component:FourFoursGame,
};
