import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBakeryState, CardBakeryAction, CardBakerySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardBakeryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardBakeryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardBakeryPlugin: GamePlugin<CardBakeryState, CardBakeryAction, typeof settings> = {
  id:"card-bakery", title:"Card Bakery", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bakery mini — rising rank sequences for the perfect loaf.",
  howToPlay:"Card Bakery is a tiny bread-rising card mini. Twelve cards arrive two at a time. Each round you decide Take (into the oven) or Skip (let it rest). The dough rises with each consecutive higher rank you take, and falls when it's lower — like real bread, momentum matters.\n\nFinal scoring: each kept card adds (rank+1) times 3 points, plus a +50 bonus if your kept cards are taken in a strictly increasing rank sequence (a perfect rise). Mixed orders still score, just without the bonus.\n\nSix rounds total (12 cards). Watch for low cards early to leave room above; high cards mid-round can accidentally cap your sequence. The patient baker reads the dough and judges the rise.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBakerySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-bakery-primary"]', pulses: 3 }), component:CardBakeryGame,
};
