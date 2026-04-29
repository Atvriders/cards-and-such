import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZingoBingoQuizState, ZingoBingoQuizAction, ZingoBingoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZingoBingoQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const zingoBingoQuizPlugin: GamePlugin<ZingoBingoQuizState, ZingoBingoQuizAction, typeof settings> = {
  id:"zingo-bingo-quiz", title:"Zingo! Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Zingo!, the rapid tile-dispenser bingo game by ThinkFun.",
  howToPlay:"Zingo! Trivia is a ten-question quiz about ThinkFun's smash-hit children's bingo variant where a Zinger device shoots two tiles at a time and players race to grab the ones matching pictures on their personal cards. Each round you'll be tested on the publisher ThinkFun, the Zinger dispenser, the picture-and-word card design, recommended ages, and how it teaches sight reading. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Zingo! has won numerous Toy of the Year awards and is praised for getting kids reading without realising — see how much you remember about its delightful design.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZingoBingoQuizSettings),
  reducer,isTerminal,component:ZingoBingoQuizGame,
};
