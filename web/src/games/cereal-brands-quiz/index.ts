import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CerealBrandsQuizState, CerealBrandsQuizAction, CerealBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CerealBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cerealBrandsQuizPlugin: GamePlugin<CerealBrandsQuizState, CerealBrandsQuizAction, typeof settings> = {
  id:"cereal-brands-quiz", title:"Cereal Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mascots and brands of breakfast cereals — Tony, Snap, Crackle, Pop.",
  howToPlay:"Cereal Brands Quiz tests your knowledge of breakfast cereal — those colorful boxes, jingles, and unforgettable mascots that have woken kids up for generations. Questions cover Kellogg's, General Mills, Post, Quaker and the characters that became cultural icons (Tony the Tiger, Toucan Sam, the Trix Rabbit, Cap'n Crunch, and more).\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Pour the milk — let's see how cereal-savvy you really are!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CerealBrandsQuizSettings),
  reducer,isTerminal,component:CerealBrandsQuizGame,
};
