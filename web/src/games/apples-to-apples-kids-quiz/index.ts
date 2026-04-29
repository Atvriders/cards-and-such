import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApplesToApplesKidsQuizState, ApplesToApplesKidsQuizAction, ApplesToApplesKidsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApplesToApplesKidsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const applesToApplesKidsQuizPlugin: GamePlugin<ApplesToApplesKidsQuizState, ApplesToApplesKidsQuizAction, typeof settings> = {
  id:"apples-to-apples-kids-quiz", title:"Apples to Apples Kids Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the family-friendly Kids edition of the classic adjective-noun party game.",
  howToPlay:"Apples to Apples Kids Trivia is meta-trivia about the family-friendly version of the classic adjective-and-noun party-judging game. Questions cover the Kids edition's vocabulary level, recommended ages, hand size, judging rules, and the differences between green and red apple cards. Each round has ten questions. Tap your answer and press Submit. A correct answer earns 100 base points plus 10 points for every second remaining on the 15-second timer — quicker answers score higher. Wrong choices reveal the correct answer and disable further input; press Next to advance. After ten questions, your final score is displayed. Whether you played Apples to Apples Kids at family game night, taught it in a classroom, or just love the simple judging mechanic that powers the genre, this quiz will rate your knowledge of the kid-friendly classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ApplesToApplesKidsQuizSettings),
  reducer,isTerminal,component:ApplesToApplesKidsQuizGame,
};
