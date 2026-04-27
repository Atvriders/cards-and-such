import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OfficeShowState, OfficeShowAction, OfficeShowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OfficeShowQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const officeShowQuizPlugin: GamePlugin<OfficeShowState, OfficeShowAction, typeof settings> = {
  id:"office-show-quiz", title:"The Office Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of The Office US: Dunder Mifflin Scranton, paper sales, and chaos.",
  howToPlay:"The Office Quiz tests your knowledge of the American mockumentary sitcom about the staff of the Dunder Mifflin paper company in Scranton, Pennsylvania. Questions cover all the unforgettable characters — Michael, Jim, Pam, Dwight, Andy, Stanley, Phyllis, Kevin, Angela, Kelly, Ryan, Toby, Creed, Meredith, Oscar, and the rest — along with running pranks, big episodes, and the show's nine-season run.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed.\n\nChoose 10, 20, or 30 questions in Settings. World's best boss vibes only!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OfficeShowSettings),
  reducer,isTerminal,component:OfficeShowQuizGame,
};
