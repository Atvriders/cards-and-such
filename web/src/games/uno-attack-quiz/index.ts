import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnoAttackQuizState, UnoAttackQuizAction, UnoAttackQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnoAttackQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const unoAttackQuizPlugin: GamePlugin<UnoAttackQuizState, UnoAttackQuizAction, typeof settings> = {
  id:"uno-attack-quiz", title:"UNO Attack! Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about UNO Attack!, the spring-loaded electronic card-launcher UNO variant.",
  howToPlay:"UNO Attack! Trivia is a ten-question quiz about the chaotic UNO variant where a battery-powered card launcher randomly spits out one or many cards to whichever player presses the button as a penalty. Each round tests your knowledge of the launcher's role, the special cards (Hit 2 and Discard All for example), the publisher Mattel, the game's history, and how it modifies regular UNO scoring. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, rewarding speed. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. UNO Attack! is famed for its spring-loaded gimmick that turns simple UNO into a dramatic free-for-all — see how much you remember about its mechanical mayhem.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UnoAttackQuizSettings),
  reducer,isTerminal,component:UnoAttackQuizGame,
};
