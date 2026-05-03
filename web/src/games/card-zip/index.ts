import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardZipState, CardZipAction, CardZipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardZipGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardZipGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardZipPlugin: GamePlugin<CardZipState, CardZipAction, typeof settings> = {
  id:"card-zip", title:"Card Zip", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Zip through a 5-card deal and count ascending pairs: 8 rounds.",
  howToPlay:"Card Zip deals you 5 random cards across 8 rounds. After each deal, the game counts how many adjacent pairs of cards are in ascending rank order (left-to-right). Each ascending pair scores 15 points. With 4 possible adjacent pairs in 5 cards, a perfect ascending-only deal nets 60 points per round.\n\nPress Zip Deal to draw. Press Next to advance. Aces are the top rank (rank 12), so a sequence like 2-5-7-J-A would score the maximum 60 points (4 ascending pairs).\n\nStatistically, half of all adjacent pairs are ascending and half descending (with rare ties skipping the bonus), so expected ascending pairs per round is around 2, giving 30 points per round and 240 across 8 rounds. Lucky monotonic deals of 3 or more ascents add up fast.\n\nThere is no skill: Card Zip is pure variance card-flopping. Just enjoy watching the cards land and rooting for those low-to-high streaks. Quick, clean, and just chaotic enough to be fun every time.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardZipSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-zip-primary"]', pulses: 3 }),component:CardZipGame,
};
