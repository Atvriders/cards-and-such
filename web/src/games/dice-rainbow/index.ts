import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRainbowState, DiceRainbowAction, DiceRainbowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRainbowGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRainbowPlugin: GamePlugin<DiceRainbowState, DiceRainbowAction, typeof settings> = {
  id:"dice-rainbow", title:"Dice Rainbow", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 6 dice — score points equal to unique faces, +50 if all six different. 6 rounds.",
  howToPlay:"Dice Rainbow is a fast variety roll. Each of the 6 rounds you fire all six dice at once and score based on how many distinct faces show up: 5 unique faces is worth 25 points, and a full \"rainbow\" of all six different faces (1-2-3-4-5-6) earns a juicy 75-point bonus. Anything below 5 unique faces scores zero.\n\nThe probability of rolling a perfect rainbow is 6! / 6^6 ≈ 1.5%, so a single rainbow is reasonably rare; getting two or more in 6 rounds is a real treat. Five-unique rolls happen about 23% of the time, so most games land 0-3 hits and a healthy 25-100 point haul.\n\nPress Roll to fling all six cubes at once. The displayed dice are sorted by face value so you can spot duplicates immediately. Press Next to move on. Cherries-to-sixes — chase that rainbow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRainbowSettings),
  reducer,isTerminal,component:DiceRainbowGame,
};
