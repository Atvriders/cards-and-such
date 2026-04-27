import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AfricanGeographyQuizState, AfricanGeographyQuizAction, AfricanGeographyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AfricanGeographyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const africanGeographyQuizPlugin: GamePlugin<AfricanGeographyQuizState, AfricanGeographyQuizAction, typeof settings> = {
  id:"african-geography-quiz", title:"African Geography Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Capitals, rivers, mountains, and deserts of the African continent.",
  howToPlay:`African Geography Quiz spans the entire continent — from Cairo on the Mediterranean to Cape Town on the Atlantic. Questions cover capital cities, major rivers like the Nile, Congo, and Zambezi, towering peaks like Kilimanjaro, the vast Sahara, and the lakes of the Great Rift Valley.\n\nYou will be tested on countries that often get confused — Niger versus Nigeria, Mali versus Malawi, Sudan and South Sudan. There are also questions on Madagascar, the African Great Lakes, and microstates you might have missed in school.\n\nEach question gives you 15 seconds. Correct answers earn 100 points plus 10 per second on the clock. Choose 10, 20, or 30 questions to play.\n\nThis quiz favors curious travelers, news junkies, and anyone who paid attention during World Geography. Africa is huge, varied, and full of surprises — let's see how much you really know.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AfricanGeographyQuizSettings),
  reducer,isTerminal,component:AfricanGeographyQuizGame,
};
