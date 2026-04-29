import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeanstalkMemQuizState, BeanstalkMemQuizAction, BeanstalkMemQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BeanstalkMemQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const beanstalkMemQuizPlugin: GamePlugin<BeanstalkMemQuizState, BeanstalkMemQuizAction, typeof settings> = {
  id:"beanstalk-mem-quiz", title:"Beanstalk Memory Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Beanstalk, the giant bean-stack card memory game.",
  howToPlay:"Beanstalk Memory Trivia is a ten-question quiz about the family card game where players plant cards in stacks and must remember which bean varieties grew where in order to harvest the right combinations later. Each round you'll be tested on the rules for planting, memorising stacks, harvesting, scoring bean-types, recommended player counts, and how Beanstalk relates to the famous Bohnanza family of games. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Beanstalk-style memory games turn the act of remembering positions into a satisfying farming theme — see how much trivia about the genre you can recall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BeanstalkMemQuizSettings),
  reducer,isTerminal,component:BeanstalkMemQuizGame,
};
