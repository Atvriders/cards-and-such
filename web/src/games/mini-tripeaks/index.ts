import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniTripeaksState, MiniTripeaksAction, MiniTripeaksSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniTripeaksGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniTripeaksPlugin: GamePlugin<MiniTripeaksState, MiniTripeaksAction, typeof settings> = {
  id:"mini-tripeaks", title:"Mini TriPeaks", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 3-peak 15-card tri-peaks solitaire mini.",
  howToPlay:"Mini TriPeaks is a tiny version of the classic TriPeaks solitaire. Three small peaks of 5 cards each are dealt — 15 cards total — plus a small reserve of 3. Tap any visible card to remove it from the peak, scoring 15 points per click. Clear all three peaks for the highest possible score.\n\nIn full TriPeaks you'd build a sequential run from the waste pile through valid up/down rank moves, but this mini distills the experience down to its joyful essence: knock down the peaks one tap at a time, rolling toward a clean board.\n\nYou have 30 clicks before the round ends. Average sharp players score around 270 with the full board cleared; even casual play yields 200+ points. A perfect 30-second tea-break solitaire.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniTripeaksSettings),
  reducer,isTerminal,component:MiniTripeaksGame,
};
