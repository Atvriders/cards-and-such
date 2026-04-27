import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChipsChompState, ChipsChompAction, ChipsChompSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChipsChompGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chipsChompPlugin: GamePlugin<ChipsChompState, ChipsChompAction, typeof settings> = {
  id:"chips-chomp", title:"Chips Chomp", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap fries and chips before they go stale. 30-second clicker.",
  howToPlay:"Chips Chomp is a snappy 30-second snack clicker. Crispy fries appear in six lanes; tap each one as fast as you can to chomp it for 10 points. Each chip lingers for a few ticks before going stale and disappearing — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh chips in random lanes. The board fills quickly with crispy targets, so practice your hand-eye coordination — every chip you snag is 10 points closer to a top score.\n\nThere's no skill ceiling: the more chips you tap in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and chow down those chips!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChipsChompSettings),
  reducer,isTerminal,component:ChipsChompGame,
};
