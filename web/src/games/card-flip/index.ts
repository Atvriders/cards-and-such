import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFlipState, CardFlipAction, CardFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFlipGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFlipPlugin: GamePlugin<CardFlipState, CardFlipAction, typeof settings> = {
  id:"card-flip", title:"Card Flip", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Classic memory pairs: 16 cards face-down, find all 8 pairs.",
  howToPlay:`Card Flip is the classic memory matching game in a quick 4x4 form. Sixteen cards lay face-down, hiding eight matching pairs of fruit symbols. Each turn you flip two cards.

If they match, they stay face-up (turning green) and you score 20 points. If they don't match, both cards flip back face-down after a short pause and you lose 2 points. Click any face-down card to flip it; you'll click two before the result is shown.

Your job is to find all 8 pairs in as few attempts as possible. Pay attention to the symbols — even when a flip mismatches, you've learned the location of two cards. Mental tags like "apple top-left" go a long way.

Score: 20 per match (160 max from matches) plus a completion bonus of 200 minus 5 per attempt (positive, no floor below zero). Mismatches cost 2 each. The minimum attempts is 8 — only happens with perfect memory or extreme luck.

Sharpen your memory and flip on!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFlipSettings),
  reducer, isTerminal, component: CardFlipGame,
};
