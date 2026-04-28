import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CraneClickState, CraneClickAction, CraneClickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CraneClickGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const craneClickPlugin: GamePlugin<CraneClickState, CraneClickAction, typeof settings> = {
  id:"crane-click", title:"Crane Click", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click crane lifts to dispatch them. 25-second clicker.",
  howToPlay:"Crane Click is a 25-second construction-themed arcade clicker — slightly shorter than the rest, so every second counts. Crane lifts swing across the screen in six lanes carrying steel beams; tap each lift as fast as you can to dispatch it cleanly for 10 points. Miss them and they swing off-board, no points awarded.\n\nThe board ticks roughly once per second, spawning fresh crane lifts in random lanes. As the worksite ramps up, the screen fills with hooks and beams — every tap is a point.\n\nThere's no skill ceiling: the more lifts you click in 25 seconds, the higher your score. Average runs land near 150-200 points; sharpshooters pushing 400+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nGet the steel beams to the top floor — and tap fast!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CraneClickSettings),
  reducer,isTerminal,component:CraneClickGame,
};
