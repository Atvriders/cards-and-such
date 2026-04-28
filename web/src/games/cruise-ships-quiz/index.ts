import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CruiseShipsQuizState, CruiseShipsQuizAction, CruiseShipsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CruiseShipsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cruiseShipsQuizPlugin: GamePlugin<CruiseShipsQuizState, CruiseShipsQuizAction, typeof settings> = {
  id:"cruise-ships-quiz", title:"Cruise Ships Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of cruise liners — Carnival, Royal Caribbean, and more.",
  howToPlay:"Cruise Ships Quiz sails into the world of leisure ocean travel. From the legendary Queen Mary 2 to today's mega-ships from Royal Caribbean, Carnival, Norwegian, and MSC — and ports of call from the Caribbean to the Mediterranean to Alaska — this quiz covers operators, ships, capacities, and history.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. All aboard — your trivia voyage starts now!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CruiseShipsQuizSettings),
  reducer,isTerminal,component:CruiseShipsQuizGame,
};
