import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZingoWordsQuizState, ZingoWordsQuizAction, ZingoWordsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZingoWordsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const zingoWordsQuizPlugin: GamePlugin<ZingoWordsQuizState, ZingoWordsQuizAction, typeof settings> = {
  id:"zingo-words-quiz", title:"Zingo! Word Builder Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Zingo! Word Builder, the literacy-themed Zingo variant.",
  howToPlay:"Zingo! Word Builder Trivia is a ten-question quiz about the literacy-focused expansion of Zingo!, where players race to grab letter tiles dispensed by the Zinger to spell sight words on their personal cards. Each round you'll be tested on the publisher ThinkFun, the Zinger device, the difference between Zingo! Word Builder and the original, recommended ages, and the words children typically learn. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Zingo! Word Builder is praised for combining the original's joyful chaos with early literacy skills — see how much trivia about its alphabet design you can recall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZingoWordsQuizSettings),
  reducer,isTerminal,component:ZingoWordsQuizGame,
};
