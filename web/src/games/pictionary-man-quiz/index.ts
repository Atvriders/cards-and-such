import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryManQuizState, PictionaryManQuizAction, PictionaryManQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryManQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pictionaryManQuizPlugin: GamePlugin<PictionaryManQuizState, PictionaryManQuizAction, typeof settings> = {
  id:"pictionary-man-quiz", title:"Pictionary Man Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pictionary Man, the 3D mannequin posing edition.",
  howToPlay:"Pictionary Man Trivia is dedicated to the unique Pictionary edition that swaps drawing with posing an articulated mannequin to convey a clue. Questions cover the box contents, target ages, mannequin design, scoring rules, and history of this charming spin-off. You'll get ten questions per round. Select an answer and press Submit. Correct answers earn 100 base points plus 10 per second remaining on the 15-second timer — quick fingers boost your score. Wrong answers stay locked in and the correct answer is revealed before you press Next. The game ends after all ten questions and your final score is shown. This quiz is perfect for collectors, party-game historians, or anyone who once received Pictionary Man as a holiday gift and still remembers posing a tiny mannequin to mime out 'shrugging.' See how thoroughly you mastered this oddly tactile party classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PictionaryManQuizSettings),
  reducer,isTerminal,component:PictionaryManQuizGame,
};
