import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MtvMusicAwardsQuizState, MtvMusicAwardsQuizAction, MtvMusicAwardsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MtvMusicAwardsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mtvMusicAwardsQuizPlugin: GamePlugin<MtvMusicAwardsQuizState, MtvMusicAwardsQuizAction, typeof settings> = {
  id:"mtv-music-awards-quiz", title:"MTV Music Awards Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of MTV Video Music Awards (VMAs) from 1984 to today.",
  howToPlay:"MTV Music Awards Quiz covers the wild, wonderful world of the VMAs. From Madonna's wedding-dress 1984 performance of 'Like a Virgin' to Michael Jackson's 'Thriller' choreography, Britney's snake, Kanye interrupting Taylor, and decades of unforgettable moments — these are the events that defined pop culture.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. If you grew up with TRL or just love an awards-show meltdown, this is your quiz!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MtvMusicAwardsQuizSettings),
  reducer,isTerminal,component:MtvMusicAwardsQuizGame,
};
