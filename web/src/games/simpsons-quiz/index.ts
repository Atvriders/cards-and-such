import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SimpsonsState, SimpsonsAction, SimpsonsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SimpsonsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const simpsonsQuizPlugin: GamePlugin<SimpsonsState, SimpsonsAction, typeof settings> = {
  id:"simpsons-quiz", title:"Simpsons Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of The Simpsons, the longest-running prime-time animated sitcom.",
  howToPlay:"Simpsons Quiz tests your knowledge of the longest-running prime-time animated sitcom in TV history, premiering in 1989 on FOX. Questions cover Homer, Marge, Bart, Lisa, Maggie, and the entire Springfield ecosystem — Mr. Burns, Smithers, Apu, Moe, Ned Flanders, Krusty, Sideshow Bob, Principal Skinner, and dozens more.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue.\n\nChoose 10, 20, or 30 questions in Settings. D'oh! Now go score some points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SimpsonsSettings),
  reducer,isTerminal,component:SimpsonsQuizGame,
};
