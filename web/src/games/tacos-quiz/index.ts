import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TacosQuizState, TacosQuizAction, TacosQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TacosQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tacosQuizPlugin: GamePlugin<TacosQuizState, TacosQuizAction, typeof settings> = {
  id:"tacos-quiz", title:"Tacos Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bite into Mexican taco varieties, fillings, and toppings across thirty street-stand questions.",
  howToPlay:"Tacos Quiz tests your knowledge of Mexico's most exported gift to the world. Questions cover the major varieties — al pastor (marinated pork on a trompo, inspired by Lebanese shawarma), carnitas (slow-cooked pork), barbacoa (pit-cooked meat), suadero, lengua, cabeza, and the regional specialties of Baja-style fish tacos and Yucatan cochinita pibil. You'll learn the difference between corn and flour tortillas, classic salsas, traditional toppings like onion-cilantro and the bright preserved red onion, and which condiments are taqueria essentials.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong ones go red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you grew up on Tuesday tacos or eat al pastor at midnight in Mexico City, this quiz delivers a full plate of taqueria knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TacosQuizSettings),
  reducer,isTerminal,component:TacosQuizGame,
};
