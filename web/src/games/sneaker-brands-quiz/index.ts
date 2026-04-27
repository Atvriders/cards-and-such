import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SneakerBrandsQuizState, SneakerBrandsQuizAction, SneakerBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SneakerBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sneakerBrandsQuizPlugin: GamePlugin<SneakerBrandsQuizState, SneakerBrandsQuizAction, typeof settings> = {
  id:"sneaker-brands-quiz", title:"Sneaker Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Nike, Adidas, Reebok and the shoes that built sneaker culture.",
  howToPlay:"Sneaker Brands Quiz tests your knowledge of the giants of footwear. Questions cover Nike, Adidas, Puma, Reebok, New Balance, Converse, Vans and Under Armour — including founders, hometowns, signature silhouettes (Air Jordan, Stan Smith, Chuck Taylor), iconic athlete partnerships, and the marketing campaigns that built sneaker culture.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Lace up — see if your sneakerhead knowledge can keep up with this quiz!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SneakerBrandsQuizSettings),
  reducer,isTerminal,component:SneakerBrandsQuizGame,
};
