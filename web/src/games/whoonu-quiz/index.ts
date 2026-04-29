import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhoonuQuizState, WhoonuQuizAction, WhoonuQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WhoonuQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const whoonuQuizPlugin: GamePlugin<WhoonuQuizState, WhoonuQuizAction, typeof settings> = {
  id:"whoonu-quiz", title:"Whoonu Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Whoonu, the favourites-ranking party card game from Cranium.",
  howToPlay:"Whoonu Trivia is a ten-question quiz about the joyful little family card game from Cranium where each round one player becomes the 'Whoonu' and must rank cards their friends play face-down based on what they predict that judge enjoys most. Each round you'll be tested on its publisher, its scoring system, the deck contents (favourite-things cards), the rotating Whoonu role, and its quirks. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so respond quickly. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions your final score is shown. Whoonu shines as a casual ice-breaker that helps players learn their friends' tastes — see how much you remember about a game that rewards knowing your friends.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WhoonuQuizSettings),
  reducer,isTerminal,component:WhoonuQuizGame,
};
