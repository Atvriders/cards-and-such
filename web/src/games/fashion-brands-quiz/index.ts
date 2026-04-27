import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FashionBrandsQuizState, FashionBrandsQuizAction, FashionBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FashionBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fashionBrandsQuizPlugin: GamePlugin<FashionBrandsQuizState, FashionBrandsQuizAction, typeof settings> = {
  id:"fashion-brands-quiz", title:"Fashion Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Chanel, Gucci, Prada and the legendary houses of haute couture.",
  howToPlay:"Fashion Brands Quiz tests your knowledge of the world's most iconic fashion houses. Questions cover founders and creative directors, country of origin, signature monograms, era of founding, and the cultural moments — from Coco Chanel's little black dress to Tom Ford's Gucci revival — that shaped luxury fashion.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you obsess over Paris runways, Italian craftsmanship, or American sportswear, this quiz puts your fashion knowledge on the catwalk!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FashionBrandsQuizSettings),
  reducer,isTerminal,component:FashionBrandsQuizGame,
};
