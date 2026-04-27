import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MushroomMashState, MushroomMashAction, MushroomMashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MushroomMashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mushroomMashPlugin: GamePlugin<MushroomMashState, MushroomMashAction, typeof settings> = {
  id:"mushroom-mash", title:"Mushroom Mash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap forest mushrooms popping up in the underbrush. 30-second clicker.",
  howToPlay:"Mushroom Mash is a 30-second forest clicker. Mushrooms pop up at random spots in six lanes; tap each one for 10 points before it withers and disappears.\n\nThe game ticks roughly once per second, spawning fresh mushrooms across the board. Each mushroom hangs around briefly, so quick reflexes are key. Miss too many and your final tally takes a hit.\n\nThere's no strategy beyond speed and aim — the more mushrooms you mash in 30 seconds, the higher your score. Average runs are 200-300 points; mash-fest masters push past 500.\n\nTip: don't fixate on one cluster — scan the entire board and prioritize the oldest, fadest mushrooms. The clock counts down in the top right; when zero, your score is locked. Embrace your inner Mario and stomp away! Get those forest fungi before they sporulate into the underbrush!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MushroomMashSettings),
  reducer,isTerminal,component:MushroomMashGame,
};
