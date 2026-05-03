import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniRummyState, MiniRummyAction, MiniRummySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniRummyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniRummyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniRummyPlugin: GamePlugin<MiniRummyState, MiniRummyAction, typeof settings> = {
  id:"mini-rummy", title:"Mini Rummy", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Receive 7 random cards and the engine auto-finds your best sets and runs. 6 rounds.",
  howToPlay:`Mini Rummy is a no-decision-required scoring exercise. Each round, you're dealt seven random cards from a freshly shuffled deck. Press Auto-score and the engine identifies the best legal melds: sets (3+ of the same rank, any suit) and runs (3+ consecutive cards of the same suit). You score 20 points per meld plus 10 per extra card beyond the third, minus a small penalty for each unmelded card.

Example: a hand with three 7s and a four-card run of hearts scores 20 + 20 + 10 = 50, less unmelded penalties.

There are six rounds. The expected per-round score is around 5-15 points; getting any meld at all in a 7-card hand is uncommon, so most runs total 30-80 points across all six rounds. Excellent runs above 100 points need real luck. There are no choices to agonize over — just deal, score, repeat.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniRummySettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-mini-rummy-primary"]', pulses: 3 }), component:MiniRummyGame,
};
