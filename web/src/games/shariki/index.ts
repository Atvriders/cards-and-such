import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SharikiState, SharikiAction, SharikiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SharikiGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sharikiPlugin: GamePlugin<SharikiState, SharikiAction, typeof settings> = {
  id:"shariki", title:"Shariki", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Original Russian pre-Bejeweled match-3 with five colors.",
  howToPlay:"Shariki is the original 1994 Russian match-three predecessor to Bejeweled, faithfully recreated as a 60-second sprint. The six-by-six grid uses just five colors of round shariki (Russian for 'little balls') for an authentic retro feel. Click two adjacent shariki to swap them. If the swap forms a row or column of three or more matching colors, those balls vanish for ten points each and the column collapses, with new shariki dropping in from above. Chains can cascade for bonus clears. Only matches resolve — invalid swaps cancel without penalty. With one fewer color than modern match-three games, matches come faster and chains build quickly. Watch for vertical drops creating accidental three-in-a-row clears. The clock counts down sixty seconds in the corner. When the timer runs out, your score is final. Top players score above 400 points by chasing those satisfying cascades. Match away!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SharikiSettings),
  reducer,isTerminal,component:SharikiGame,
};
