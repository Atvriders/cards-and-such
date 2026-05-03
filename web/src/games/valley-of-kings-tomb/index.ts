import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ValleyOfKingsTombState, ValleyOfKingsTombAction, ValleyOfKingsTombSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ValleyOfKingsTombGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ValleyOfKingsTombGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const valleyOfKingsTombPlugin: GamePlugin<ValleyOfKingsTombState, ValleyOfKingsTombAction, typeof settings> = {
  id:"valley-of-kings-tomb",
  title:"Valley of Kings Tomb",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Entomb fantasy cards for points.",
  howToPlay:"Valley of Kings Tomb is a 10-round Egyptian-fantasy card game inspired by the deckbuilder. Each round, three artifact cards are drawn from the Pyramid: Pottery (1), Scarab (2), Mask (3), Crown (4), Sarcophagus (5), and Pharaoh (8). Sum their values for your round score. 🏺\n\nTomb scoring: there's a 5-point bonus if all three artifacts in a round are different. Matching pairs lose the bonus but bring decent base score. Across 10 rounds, expect totals around 90 to 130.\n\nPress Draw to plunder the next pyramid chamber, then Next to descend further. Each artifact glows according to its rarity — Pharaoh in gold. Score 120+ to be the Valley of Kings expert tomb robber. The game finishes in less than a minute — a quick Egyptian-fantasy raid for a busy break. Each round its own little revelation.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ValleyOfKingsTombSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-valley-of-kings-tomb-primary"]', pulses: 3 }),
  component:ValleyOfKingsTombGame,
};
