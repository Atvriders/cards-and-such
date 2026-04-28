import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DogCareQuizState, DogCareQuizAction, DogCareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DogCareQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dogCareQuizPlugin: GamePlugin<DogCareQuizState, DogCareQuizAction, typeof settings> = {
  id:"dog-care-quiz", title:"Dog Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Vaccinations, grooming, training — test your dog care knowledge.",
  howToPlay:"Dog Care Quiz tests your knowledge of canine health, training, grooming, nutrition, and behavior. Dogs are the original best friend, and a happy dog is the result of attentive care — from puppy vaccines and crate training to senior diet and dental hygiene, this quiz covers it all.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you are a first-time owner or a lifelong dog lover, this quiz will paws-itively challenge you!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DogCareQuizSettings),
  reducer,isTerminal,component:DogCareQuizGame,
};
