import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MafiaQuizState, MafiaQuizAction, MafiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MafiaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mafiaQuizPlugin: GamePlugin<MafiaQuizState, MafiaQuizAction, typeof settings> = {
  id:"mafia-quiz", title:"Mafia History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Mafia: Sicily, New York, Las Vegas.",
  howToPlay:"Mafia History Quiz explores organized crime from its Sicilian roots through American Cosa Nostra, Las Vegas, and the modern era. From Lucky Luciano to John Gotti, from Castellammarese War to Apalachin Meeting, from RICO laws to the witness protection program — the dark history of the Mob is covered.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Goodfellas, Godfather fans, and history buffs will find plenty of fedora-wearing facts to chew on.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MafiaQuizSettings),
  reducer,isTerminal,component:MafiaQuizGame,
};
