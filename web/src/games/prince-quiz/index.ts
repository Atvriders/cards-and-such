import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PrinceQuizState, PrinceQuizAction, PrinceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PrinceQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const princeQuizPlugin: GamePlugin<PrinceQuizState, PrinceQuizAction, typeof settings> = {
  id:"prince-quiz", title:"Prince Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Prince — Purple Rain, the Revolution, and Paisley Park.",
  howToPlay:`Prince Quiz tests your knowledge of one of the most prolific and inventive artists in popular music. From his Minneapolis roots through funk, rock, soul, and pop, you'll be quizzed on songs, albums, his backing band The Revolution, the symbol-era period, his Paisley Park studio, and the films, alter egos, and Grammy-winning moments that defined a singular career.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Dearly beloved!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PrinceQuizSettings),
  reducer,isTerminal,component:PrinceQuizGame,
};
