import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KatrinaQuizState, KatrinaQuizAction, KatrinaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KatrinaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const katrinaQuizPlugin: GamePlugin<KatrinaQuizState, KatrinaQuizAction, typeof settings> = {
  id:"katrina-quiz", title:"Hurricane Katrina Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Hurricane Katrina and the 2005 New Orleans disaster.",
  howToPlay:"Hurricane Katrina Quiz tests your knowledge of one of America's deadliest and costliest natural disasters. Questions cover the Category 5 Atlantic hurricane that struck the Gulf Coast on August 29, 2005, the catastrophic levee failures in New Orleans, the flooding of the Lower Ninth Ward, the Superdome shelter, and the controversial federal response. You'll be asked about evacuation orders, FEMA, the U.S. Army Corps of Engineers, and the rebuilding effort.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KatrinaQuizSettings),
  reducer,isTerminal,component:KatrinaQuizGame,
};
