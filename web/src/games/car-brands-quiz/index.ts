import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarBrandsQuizState, CarBrandsQuizAction, CarBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const carBrandsQuizPlugin: GamePlugin<CarBrandsQuizState, CarBrandsQuizAction, typeof settings> = {
  id:"car-brands-quiz", title:"Car Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify legendary automotive brands by logo, slogan, and history.",
  howToPlay:"Car Brands Quiz tests your knowledge of the world's most iconic automakers. Questions cover logos, country of origin, founding stories, slogans, famous models, and the executives and engineers who shaped the auto industry — from Henry Ford and Ferdinand Porsche to Soichiro Honda and Enzo Ferrari.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you live for German engineering, Italian exotics, or American muscle, this quiz will rev your engine and put your automotive trivia to the ultimate test!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CarBrandsQuizSettings),
  reducer,isTerminal,component:CarBrandsQuizGame,
};
