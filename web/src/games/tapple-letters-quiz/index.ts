import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TappleLettersQuizState, TappleLettersQuizAction, TappleLettersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TappleLettersQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tappleLettersQuizPlugin: GamePlugin<TappleLettersQuizState, TappleLettersQuizAction, typeof settings> = {
  id:"tapple-letters-quiz", title:"Tapple Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Tapple, the press-the-letter category-naming party word game.",
  howToPlay:"Tapple Trivia is a ten-century quiz about the word-association party game where players take turns naming items in a category (animals, fruits, etc.) by pressing one of the 20 letter buttons on the central wheel before a 10-second timer runs out. Each round tests your knowledge of the publisher USAopoly (now The Op), the wheel mechanics, the category cards, the rules for elimination, and recommended ages. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Tapple has won numerous family game-of-the-year awards thanks to its perfectly tuned tension — see how many of its quirks you remember.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TappleLettersQuizSettings),
  reducer,isTerminal,component:TappleLettersQuizGame,
};
