import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SubwaysQuizState, SubwaysQuizAction, SubwaysQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SubwaysQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const subwaysQuizPlugin: GamePlugin<SubwaysQuizState, SubwaysQuizAction, typeof settings> = {
  id:"subways-quiz", title:"Subways Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of urban metros and subway systems worldwide.",
  howToPlay:"Subways Quiz takes you underground into the world of metro systems — from London's Tube and Paris's Métro to New York City's MTA, Tokyo's vast network, Moscow's palatial stations, and beyond. Test your knowledge of the lines, stations, gauges, and history of urban rapid transit around the globe.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Mind the gap, and let's roll!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SubwaysQuizSettings),
  reducer,isTerminal,component:SubwaysQuizGame,
};
