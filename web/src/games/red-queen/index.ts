import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedQueenState, RedQueenAction, RedQueenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RedQueenGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RedQueenGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const redQueenPlugin: GamePlugin<RedQueenState, RedQueenAction, typeof settings> = {
  id:"red-queen", title:"Red Queen", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score 25 points each time you draw a red Queen. 12 draws.",
  howToPlay:"Red Queen is a quick luck-based card minigame. Each click of the Draw button reshuffles the deck and reveals one card; your aim is to land red Queens (the Queen of Hearts and the Queen of Diamonds).\n\nEach red Queen flipped is worth 25 points; everything else scores zero. The two red Queens hide among 52 cards, so the per-draw probability is roughly 1 in 26. Across 12 draws, an average run scores 0-50 points; pulling multiple red Queens in a single game is genuinely rare.\n\nEach draw is independent — there's no penalty for misses, just keep clicking. The displayed card shows its rank and suit; red ♥ and ♦ paired with Q are the only winners.\n\nWhen all 12 draws are complete, your score is locked in. Channel a little royal luck and crown your run!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RedQueenSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-red-queen-primary"]', pulses: 3 }),component:RedQueenGame,
};
