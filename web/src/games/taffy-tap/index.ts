import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TaffyTapState, TaffyTapAction, TaffyTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TaffyTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const taffyTapPlugin: GamePlugin<TaffyTapState, TaffyTapAction, typeof settings> = {
  id:"taffy-tap", title:"Taffy Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap stretchy taffy at the right tension \u2014 25-second sweet clicker.",
  howToPlay:"Taffy Tap is a chewy 25-second clicker arcade. Stretchy pieces of saltwater taffy drift across six lanes of the playfield; tap each piece as fast as you can to pull it for 10 points. Each taffy is only on screen for a few ticks before stretching away, so don't dawdle.\n\nThe game ticks roughly once per second, spawning fresh taffy in random lanes. The board fills quickly with bright candies, so keep your tapping rhythm steady. Every taffy you tap is 10 sticky-sweet points closer to a top score.\n\nNo strategy, just precision and speed. The more taffy you tap in 25 seconds, the higher your score. Average runs land near 180-260 points; sharp-eyed clickers push 400+ on a hot streak. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nTap quick before the taffy stretches away!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TaffyTapSettings),
  reducer,isTerminal,component:TaffyTapGame,
};
