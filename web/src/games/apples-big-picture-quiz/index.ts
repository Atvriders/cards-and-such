import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApplesBigPictureQuizState, ApplesBigPictureQuizAction, ApplesBigPictureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApplesBigPictureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const applesBigPictureQuizPlugin: GamePlugin<ApplesBigPictureQuizState, ApplesBigPictureQuizAction, typeof settings> = {
  id:"apples-big-picture-quiz", title:"Apples to Apples Big Picture Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Big Picture, the visual edition of Apples to Apples using illustrations.",
  howToPlay:"Apples to Apples Big Picture Trivia covers the visual edition of Apples to Apples, where red apple noun cards are replaced by photos and illustrations and players match them against green apple adjectives. Questions explore the publisher, the players, the visual focus, the scoring, and how Big Picture compares to the original. Each round contains ten questions. Tap an answer and press Submit. Correct answers award 100 base points plus 10 points per second left on the 15-second timer — fast picks score higher. Wrong answers reveal the correct option and disable further input; press Next to continue. After ten questions, your final score is shown. If you ever judged a Big Picture card pile and watched a wonderfully wrong-but-creative match win the round, this quiz will let you prove how thoroughly you remember the rules.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ApplesBigPictureQuizSettings),
  reducer,isTerminal,component:ApplesBigPictureQuizGame,
};
