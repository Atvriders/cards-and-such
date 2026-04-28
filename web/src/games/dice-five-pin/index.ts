import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFivePinState, DiceFivePinAction, DiceFivePinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFivePinGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFivePinPlugin: GamePlugin<DiceFivePinState, DiceFivePinAction, typeof settings> = {
  id:"dice-five-pin", title:"Dice Five-Pin Bowl", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Canadian 5-pin: 10 frames, point pins.",
  howToPlay:"Five-Pin Dice Bowl simulates the Canadian variant where pins carry different point values: the head pin is 5, two flanking pins are 3 each, and corner pins are 2 each, totalling 15 per frame instead of 10.\n\nEach round you Roll two six-sided dice. The frame score equals the sum minus 1, capped between 0 and 15 — so the expected per-frame value is around 6, and totals usually land between 50 and 80. A perfect run of 11 every frame gives a maximum of 110 in this mini, mapping roughly to a cleanly-rolled five-pin game.\n\nFive-pin is hugely popular across Canada and rare elsewhere, with smaller balls (no thumb hole) and three rolls per frame in real life. The mini collapses that to one die-roll per frame for speed. Press Roll, then Next. Quick, distinctively Canadian, and a fun cousin to ten-pin.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFivePinSettings),
  reducer,isTerminal,component:DiceFivePinGame,
};
