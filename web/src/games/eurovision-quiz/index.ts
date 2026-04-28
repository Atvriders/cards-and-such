import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EurovisionQuizState, EurovisionQuizAction, EurovisionQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EurovisionQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const eurovisionQuizPlugin: GamePlugin<EurovisionQuizState, EurovisionQuizAction, typeof settings> = {
  id:"eurovision-quiz", title:"Eurovision Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Eurovision Song Contest from the 1950s to today.",
  howToPlay:"Eurovision Quiz tests your knowledge of Europe's biggest music competition. Questions span decades — from the 1956 inaugural contest in Lugano to ABBA's 1974 Waterloo win, Celine Dion's 1988 victory for Switzerland, Lordi's monster rock in 2006, Conchita Wurst's 2014 triumph, Netta in 2018, Kalush Orchestra in 2022, and Loreen's two-time wins.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you obsessively follow the semi-finals or just love the camp and confetti, Eurovision Quiz will have you saying \"douze points!\"",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EurovisionQuizSettings),
  reducer,isTerminal,component:EurovisionQuizGame,
};
