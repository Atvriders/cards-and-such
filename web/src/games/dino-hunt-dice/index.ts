import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DinoHuntDiceState, DinoHuntDiceAction, DinoHuntDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DinoHuntDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dinoHuntDicePlugin: GamePlugin<DinoHuntDiceState, DinoHuntDiceAction, typeof settings> = {
  id:"dino-hunt-dice", title:"Dino Hunt Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Push-your-luck dino capture. Roll 3 dice/round; capture, escape, or trample. 10 rounds.",
  howToPlay:"Dino Hunt Dice is a thematic push-your-luck game where you \"hunt\" three dice each round. Each die has three outcomes: faces 1-2 = Capture (score points), 3-4 = Escape (no effect), 5-6 = Trample (the round ends with whatever you've captured).\n\nIn this version, each round auto-rolls three dice. Each Capture face contributes that die's value × 10 to your score for the round. Tramples don't actually wipe (since this is single-roll), but you only score the captures. Each round you hunt and bank.\n\n10 rounds total. With 1/3 capture probability per die, expect about 1 capture per round on average. Average expected score: 60-140 points across the session.\n\nThematic and quick — the chase, the escape, the danger of the stomp. May the dice favor your safari today.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DinoHuntDiceSettings),
  reducer,isTerminal,component:DinoHuntDiceGame,
};
