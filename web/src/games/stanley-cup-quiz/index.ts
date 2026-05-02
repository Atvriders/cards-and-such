import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StanleyCupQuizState, StanleyCupQuizAction, StanleyCupQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StanleyCupQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const stanleyCupQuizPlugin: GamePlugin<StanleyCupQuizState, StanleyCupQuizAction, typeof settings> = {
  id:"stanley-cup-quiz", title:"Stanley Cup Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of NHL Stanley Cup history.",
  howToPlay:"Stanley Cup Quiz tests your knowledge of hockey's ultimate prize. Questions cover champion franchises, Conn Smythe winners, dynasty teams, overtime heroes, and the players whose names are engraved in Lord Stanley's silver chalice.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Maurice Richard to Wayne Gretzky to Sidney Crosby, the Stanley Cup is hockey royalty. Lace up and skate through the trivia!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StanleyCupQuizSettings),
  reducer,isTerminal,
  hint: (state: StanleyCupQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StanleyCupQuizGame,
};
