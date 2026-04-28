import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Daytona500QuizState, Daytona500QuizAction, Daytona500QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Daytona500QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const daytona500QuizPlugin: GamePlugin<Daytona500QuizState, Daytona500QuizAction, typeof settings> = {
  id:"daytona-500-quiz", title:"Daytona 500 Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of NASCAR Daytona 500 history.",
  howToPlay:"Daytona 500 Quiz tests your knowledge of 'The Great American Race.' Questions cover NASCAR Cup champions, iconic drivers, Daytona Beach traditions, Wood Brothers Racing, the Petty dynasty, and the breathtaking finishes that make Daytona the Super Bowl of stock car racing.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Richard Petty's seven wins to Dale Earnhardt's emotional 1998 victory, Daytona 500 Quiz is for fans who love rubbing fenders.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Daytona500QuizSettings),
  reducer,isTerminal,component:Daytona500QuizGame,
};
