import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PiratesQuizState, PiratesQuizAction, PiratesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PiratesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const piratesQuizPlugin: GamePlugin<PiratesQuizState, PiratesQuizAction, typeof settings> = {
  id:"pirates-quiz", title:"Pirates History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Golden Age of Piracy and famous pirates.",
  howToPlay:"Pirates History Quiz sails through the Golden Age of Piracy (roughly 1650-1730) and beyond. Blackbeard, Calico Jack, Anne Bonny, Mary Read, Henry Morgan, William Kidd — the questions cover the most notorious sea robbers, their ships, their hauls, and the legal and military responses that ended the era.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Buccaneers, history buffs, and Pirates of the Caribbean fans will all find plenty of treasure here. Yo ho!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PiratesQuizSettings),
  reducer,isTerminal,component:PiratesQuizGame,
};
