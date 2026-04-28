import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorseCareQuizState, HorseCareQuizAction, HorseCareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HorseCareQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const horseCareQuizPlugin: GamePlugin<HorseCareQuizState, HorseCareQuizAction, typeof settings> = {
  id:"horse-care-quiz", title:"Horse Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hooves, hay, tack — test your equine husbandry knowledge.",
  howToPlay:"Horse Care Quiz tests your knowledge of equine husbandry. From feeding hay and grain to hoof care, vaccinations, tack, and ground manners, horses are demanding partners. This quiz covers the breadth of horse ownership and barn management.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Saddle up!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HorseCareQuizSettings),
  reducer,isTerminal,component:HorseCareQuizGame,
};
