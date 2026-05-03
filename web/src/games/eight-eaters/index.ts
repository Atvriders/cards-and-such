import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EightEatersState, EightEatersAction, EightEatersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EightEatersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EightEatersGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const eightEatersPlugin: GamePlugin<EightEatersState, EightEatersAction, typeof settings> = {
  id:"eight-eaters", title:"Eight Eaters", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 12 cards. Eights are gold (+50). Other cards earn a small consolation +5.",
  howToPlay:`Eight Eaters is a quick card-drawing solo arcade. Each round, one random card from a standard 52-card deck is dealt face-up. If it's an Eight of any suit, you score a fat +50 points. If it's any other rank, you still pocket a +5 consolation pip — every draw counts for something.

You play 12 draws total. Eights are 4-in-52 (about 7.7% per draw), so a typical game lands on one or two eights. Three or more is a strong run.

There's no skill in Eight Eaters — it's pure seeded RNG, so identical seeds replay identically. The fun is in watching the cards turn over and counting your eights as they accumulate. Will you have a streak of consolation cards followed by a glorious chain of eights? Or will the deck taunt you with sevens and nines?

Click Draw, see your card, click Next, repeat. Simple, light, and just a little bit addictive.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EightEatersSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-eight-eaters-primary"]', pulses: 3 }),component:EightEatersGame,
};
