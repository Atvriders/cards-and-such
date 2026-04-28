import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EthiopianCuisineQuizState, EthiopianCuisineQuizAction, EthiopianCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EthiopianCuisineQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ethiopianCuisineQuizPlugin: GamePlugin<EthiopianCuisineQuizState, EthiopianCuisineQuizAction, typeof settings> = {
  id:"ethiopian-cuisine-quiz", title:"Ethiopian Cuisine Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Injera, wats, berbere, and the food traditions of the Horn of Africa.",
  howToPlay:`Ethiopian Cuisine Quiz tests your knowledge of injera, wats, berbere, and the food traditions of the Horn of Africa. Each question presents four answer choices; select one and submit before the 15-second timer runs out.

Correct answers earn 100 base points plus 10 points for every second you had remaining on the clock — answer quickly to maximize your tally. Wrong answers earn nothing, and the right answer is always revealed before you continue.

Tap a choice to select it (the box turns blue), then press Submit to lock in. Correct selections glow green; incorrect ones turn red while the right answer also lights up. Press Next to advance.

Choose 5 or 10 questions in Settings — Settings, then Questions. The pool is randomized and the choices within each question are shuffled, so even repeated plays feel fresh. Whether you are a casual home cook curious about world cuisine or a dedicated foodie traveler, this quiz is a tasty way to test your knowledge.

Eat well and quiz hard!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EthiopianCuisineQuizSettings),
  reducer,isTerminal,component:EthiopianCuisineQuizGame,
};
