import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourColorFlushState, FourColorFlushAction, FourColorFlushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourColorFlushGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fourColorFlushPlugin: GamePlugin<FourColorFlushState, FourColorFlushAction, typeof settings> = {
  id:"four-color-flush", title:"Four Color Flush", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Get all 4 suits in 4 draws to score 100. 8 rounds.",
  howToPlay:"Four Color Flush is a fast suit-collection minigame. Each round you draw four cards in a row from a freshly shuffled deck. If those four cards include all four suits — Spades, Hearts, Diamonds and Clubs — you score 100 points.\n\nIf you miss even one suit (because of a duplicate among the four), the round is worth zero. The probability of drawing four distinct suits in four draws from a 52-card deck is about 11%, so a perfect 8-round game is extremely rare; expect 0-300 points across most runs.\n\nHit Deal at the start of each round to flip all four cards and instantly see whether your rainbow held up. Then press Next to move on.\n\nEight rounds total. Lock your luck, count the suits, and try to flush your way to a top score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FourColorFlushSettings),
  reducer,isTerminal,component:FourColorFlushGame,
};
