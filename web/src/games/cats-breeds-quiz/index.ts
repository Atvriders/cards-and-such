import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CatsBreedsQuizState, CatsBreedsQuizAction, CatsBreedsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CatsBreedsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const catsBreedsQuizPlugin: GamePlugin<CatsBreedsQuizState, CatsBreedsQuizAction, typeof settings> = {
  id:"cats-breeds-quiz", title:"Cat Breeds Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stalk through thirty questions on the world's most beloved cat breeds — origins, coat types, and quirks.",
  howToPlay:"Cat Breeds Quiz tests your knowledge of felis catus across the globe. Questions cover the major recognized breeds — Persian, Siamese, Maine Coon, Ragdoll, Bengal, Abyssinian, Russian Blue, Sphynx, Scottish Fold, British Shorthair, Norwegian Forest, Devon Rex, Cornish Rex, Burmese, Birman, and more. You'll see questions on coat patterns (tabby, calico, tortoiseshell, colorpoint), origin countries, distinctive features (folded ears, hairlessness, polydactyly), and traditional jobs from rat-catching to royal companionship.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong ones flash red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you breed champion show cats or share your couch with a fluffy mystery, this quiz delivers a basket of feline knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CatsBreedsQuizSettings),
  reducer,isTerminal,component:CatsBreedsQuizGame,
};
