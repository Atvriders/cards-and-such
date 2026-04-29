import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryCardGameQuizState, PictionaryCardGameQuizAction, PictionaryCardGameQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryCardGameQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pictionaryCardGameQuizPlugin: GamePlugin<PictionaryCardGameQuizState, PictionaryCardGameQuizAction, typeof settings> = {
  id:"pictionary-card-game-quiz", title:"Pictionary Card Game Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the compact travel version of Pictionary using only cards and a timer.",
  howToPlay:"Pictionary Card Game Trivia challenges your familiarity with the pocket-sized Pictionary edition that strips away the board and uses only cards, sand timers, and small whiteboards. Questions cover its publisher history, its category structure, the simplified scoring, and how it compares to the full-board version. Ten questions total appear in this quiz. For each question, tap a choice and then press Submit. Correct answers award 100 points plus 10 points for each second remaining on the 15-second clock — speed pays. A wrong answer reveals the correct one and you press Next to continue. The game ends after the final question, and your final score combines accuracy with the bonuses you earned from quick thinking. Whether you played Pictionary on the road in the late 1990s or you remember the small tin box edition, this quiz will gauge how much trivia you really retained.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PictionaryCardGameQuizSettings),
  reducer,isTerminal,component:PictionaryCardGameQuizGame,
};
