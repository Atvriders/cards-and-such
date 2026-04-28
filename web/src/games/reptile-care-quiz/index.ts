import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReptileCareQuizState, ReptileCareQuizAction, ReptileCareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReptileCareQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const reptileCareQuizPlugin: GamePlugin<ReptileCareQuizState, ReptileCareQuizAction, typeof settings> = {
  id:"reptile-care-quiz", title:"Reptile Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Snakes, lizards, turtles — test your herp husbandry knowledge.",
  howToPlay:"Reptile Care Quiz tests your knowledge of herptile husbandry. From bearded dragons and leopard geckos to ball pythons, corn snakes, and aquatic turtles, reptiles need precise temperatures, humidity, lighting, and diet. This quiz covers the essentials.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Bask in your knowledge — let's go!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ReptileCareQuizSettings),
  reducer,isTerminal,component:ReptileCareQuizGame,
};
