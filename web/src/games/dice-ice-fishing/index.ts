import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceIceFishingState, DiceIceFishingAction, DiceIceFishingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceIceFishingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceIceFishingPlugin: GamePlugin<DiceIceFishingState, DiceIceFishingAction, typeof settings> = {
  id:"dice-ice-fishing", title:"Ice Fishing Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Ice-fishing cold-weather dice game: 10 holes, 2 dice per hole.",
  howToPlay:"Ice Fishing Dice distills the ice-fishing card game variant into a quick 10-hole dice game. Each hole you roll two dice; the sum (2-12) represents your catch from that ice hole — high rolls are walleye and pike trophies, low rolls are nothing biting in 30-below windchill. Add up totals across all 10 holes for your final score. Ice-fishing card games simulate winter fishing in northern lakes — Minnesota, Wisconsin, Manitoba, Saskatchewan — capturing the experience of drilling holes, jigging, tip-ups, hand-line tactics, and waiting in the cold. Catch targets include walleye, northern pike, perch, crappie, lake trout, and burbot. Hardcore ice-anglers love these card games as off-season warmups. Real ice-fishing card games model ice thickness and hole placement; this digital mini abstracts it as 2d6. Expected per-hole average 7, total 70 across 10 holes. Hot streaks push 100; cold slip to 50.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceIceFishingSettings),
  reducer,isTerminal,component:DiceIceFishingGame,
};
