import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaperclipPinchState, PaperclipPinchAction, PaperclipPinchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaperclipPinchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const paperclipPinchPlugin: GamePlugin<PaperclipPinchState, PaperclipPinchAction, typeof settings> = {
  id:"paperclip-pinch", title:"Paperclip Pinch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click paperclips before they slide off. 30-second clicker.",
  howToPlay:"Paperclip Pinch is a 30-second office-supply clicker. Paperclips spawn across 6 lanes; tap each one to pinch it for 10 points. Each paperclip lingers for a few ticks before slipping off the page — miss too many and your final tally suffers.\n\nThe game ticks once per second, spawning fresh paperclips in random lanes. The board can quickly fill with shiny targets, so practice your hand-eye coordination and aim carefully — every paperclip you pinch is 10 points closer to a top score.\n\nThere's no skill ceiling: the more paperclips you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent.\n\nPinch them all and rack up the points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PaperclipPinchSettings),
  reducer,isTerminal,component:PaperclipPinchGame,
};
