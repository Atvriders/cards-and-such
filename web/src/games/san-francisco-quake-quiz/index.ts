import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SanFranciscoQuakeQuizState, SanFranciscoQuakeQuizAction, SanFranciscoQuakeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SanFranciscoQuakeQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sanFranciscoQuakeQuizPlugin: GamePlugin<SanFranciscoQuakeQuizState, SanFranciscoQuakeQuizAction, typeof settings> = {
  id:"san-francisco-quake-quiz", title:"1906 SF Earthquake Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 1906 San Francisco earthquake and fire.",
  howToPlay:"1906 SF Earthquake Quiz tests your knowledge of one of America's most devastating natural disasters. Questions cover the magnitude 7.9 earthquake on April 18, 1906, the fires that destroyed much of the city, the role of the San Andreas Fault, the response of the U.S. Army, and the city's remarkable rebuilding. You'll be asked about famous survivors like Enrico Caruso, the destruction of City Hall, and the influence on building codes.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SanFranciscoQuakeQuizSettings),
  reducer,isTerminal,component:SanFranciscoQuakeQuizGame,
};
