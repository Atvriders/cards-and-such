import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WimbledonQuizState, WimbledonQuizAction, WimbledonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WimbledonQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wimbledonQuizPlugin: GamePlugin<WimbledonQuizState, WimbledonQuizAction, typeof settings> = {
  id:"wimbledon-quiz", title:"Wimbledon Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Wimbledon Championships history.",
  howToPlay:"Wimbledon Quiz tests your knowledge of tennis's most prestigious tournament. Questions cover champions, finals, longest matches, surface specialists, royal box moments, and the strawberries-and-cream tradition of the All England Club.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Borg's five straight titles to the Federer-Nadal 2008 epic to Serena's seven Plates, Wimbledon Quiz is for tennis fans who love the grass.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WimbledonQuizSettings),
  reducer,isTerminal,component:WimbledonQuizGame,
};
