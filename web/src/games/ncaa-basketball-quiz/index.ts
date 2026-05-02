import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NcaaBasketballQuizState, NcaaBasketballQuizAction, NcaaBasketballQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NcaaBasketballQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ncaaBasketballQuizPlugin: GamePlugin<NcaaBasketballQuizState, NcaaBasketballQuizAction, typeof settings> = {
  id:"ncaa-basketball-quiz", title:"NCAA Basketball Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of NCAA basketball history.",
  howToPlay:"NCAA Basketball Quiz tests your knowledge of college hoops glory. Questions cover March Madness Cinderellas, Final Four legends, championship coaches, dominant programs, iconic players, and the buzzer-beaters that define the tournament.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Wooden's UCLA dynasty to Coach K's Duke teams, from Christian Laettner to Stephen Curry, NCAA Basketball Quiz is for hoops fans who live for the brackets!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NcaaBasketballQuizSettings),
  reducer,isTerminal,
  hint: (state: NcaaBasketballQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NcaaBasketballQuizGame,
};
