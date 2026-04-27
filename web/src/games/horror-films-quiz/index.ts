import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorrorFilmsQuizState, HorrorFilmsQuizAction, HorrorFilmsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HorrorFilmsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const horrorFilmsQuizPlugin: GamePlugin<HorrorFilmsQuizState, HorrorFilmsQuizAction, typeof settings> = {
  id:"horror-films-quiz", title:"Horror Films Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of horror cinema — slashers, classics, and modern frighteners.",
  howToPlay:`Horror Films Quiz tests your knowledge of horror cinema across the decades. From classic Hitchcock and Romero through 1970s slashers like 'Halloween' and 'A Nightmare on Elm Street', up to modern masters like Jordan Peele and Ari Aster, you'll be quizzed on directors, killers, classic monsters, and franchises that defined the genre. Expect Freddy, Jason, Michael Myers, Pennywise, and Hannibal Lecter, alongside questions about novelist Stephen King and the shockers from A24.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Lock the doors!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HorrorFilmsQuizSettings),
  reducer,isTerminal,component:HorrorFilmsQuizGame,
};
