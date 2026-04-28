import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarmAnimalQuizState, FarmAnimalQuizAction, FarmAnimalQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FarmAnimalQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const farmAnimalQuizPlugin: GamePlugin<FarmAnimalQuizState, FarmAnimalQuizAction, typeof settings> = {
  id:"farm-animal-quiz", title:"Farm Animal Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cows, chickens, pigs, sheep, goats — test your livestock care.",
  howToPlay:"Farm Animal Care Quiz tests your knowledge of livestock husbandry. From dairy and beef cattle to laying hens, pigs, sheep, and goats, farm animals require specific feeding, housing, and health management. This quiz covers core practices for hobby farmers and homesteaders.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Down on the farm — let's see what you know!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FarmAnimalQuizSettings),
  reducer,isTerminal,component:FarmAnimalQuizGame,
};
