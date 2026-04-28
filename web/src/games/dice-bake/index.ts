import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBakeState, DiceBakeAction, DiceBakeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBakeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBakePlugin: GamePlugin<DiceBakeState, DiceBakeAction, typeof settings> = {
  id:"dice-bake", title:"Dice Bake", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bake a dice cake: beat your previous sum.",
  howToPlay:"Dice Bake rolls 3 dice each round across 6 rounds. You score the sum times 2 only if your current roll's sum strictly exceeds the previous round's sum. The first roll has no benchmark (treated as previous = 0), so it almost always scores. Each subsequent roll must climb higher to score.\n\nPress Bake to roll. Press Next to advance.\n\nAverage sum of 3 dice is 10.5; max is 18, min is 3. Once you have baked an 18, you are stuck: no future round can beat that and zero out points until you start rolling sub-18 sums again. Lower starting sums (like 4 or 5) leave plenty of room to climb.\n\nStrategy is moot since you cannot choose to skip: every roll happens. But the sequence matters: rolling 4, 7, 10, 13, 16, 18 is the dream ascent (sums times 2 equals 8+14+20+26+32+36 = 136). Realistically you will bounce above and below, scoring on roughly half the rolls. Average score is around 60-75 points across 6 rounds. Bake well!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBakeSettings),
  reducer,isTerminal,component:DiceBakeGame,
};
