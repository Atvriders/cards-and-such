import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseRegionalCuisineQuizState, ChineseRegionalCuisineQuizAction, ChineseRegionalCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChineseRegionalCuisineQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chineseRegionalCuisineQuizPlugin: GamePlugin<ChineseRegionalCuisineQuizState, ChineseRegionalCuisineQuizAction, typeof settings> = {
  id:"chinese-regional-cuisine-quiz", title:"Chinese Regional Cuisine Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Eight Great Traditions: Sichuan, Cantonese, Hunan, Shandong, and beyond.",
  howToPlay:`Chinese Regional Cuisine Quiz tests your knowledge of eight Great Traditions: Sichuan, Cantonese, Hunan, Shandong, and beyond. Each question presents four answer choices; select one and submit before the 15-second timer runs out.

Correct answers earn 100 base points plus 10 points for every second you had remaining on the clock — answer quickly to maximize your tally. Wrong answers earn nothing, and the right answer is always revealed before you continue.

Tap a choice to select it (the box turns blue), then press Submit to lock in. Correct selections glow green; incorrect ones turn red while the right answer also lights up. Press Next to advance.

Choose 5 or 10 questions in Settings — Settings, then Questions. The pool is randomized and the choices within each question are shuffled, so even repeated plays feel fresh. Whether you are a casual home cook curious about world cuisine or a dedicated foodie traveler, this quiz is a tasty way to test your knowledge.

Eat well and quiz hard!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChineseRegionalCuisineQuizSettings),
  reducer,isTerminal,component:ChineseRegionalCuisineQuizGame,
};
