import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EraserTapState, EraserTapAction, EraserTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EraserTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const eraserTapPlugin: GamePlugin<EraserTapState, EraserTapAction, typeof settings> = {
  id:"eraser-tap", title:"Eraser Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click erasers that bounce around. 30-second clicker.",
  howToPlay:"Eraser Tap is a 30-second office-supply clicker. Pink erasers spawn across 6 lanes; tap each one to wipe it away for 10 points. Each eraser hangs around for a few ticks before drifting off the page — miss too many and your final tally suffers.\n\nThe game ticks once per second, spawning fresh erasers in random lanes. The board can quickly fill with bouncy targets, so practice your hand-eye coordination and aim carefully.\n\nThere's no skill ceiling: the more erasers you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent.\n\nWipe out the high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EraserTapSettings),
  reducer,isTerminal,
  hint: (state: EraserTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".fc-target", pulses: 3 };
  },
  component:EraserTapGame,
};
