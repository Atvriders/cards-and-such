import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TitanicQuizState, TitanicQuizAction, TitanicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TitanicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const titanicQuizPlugin: GamePlugin<TitanicQuizState, TitanicQuizAction, typeof settings> = {
  id:"titanic-quiz", title:"Titanic Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the RMS Titanic — its construction, voyage, and tragic sinking.",
  howToPlay:"Titanic Quiz tests your knowledge of one of history's most famous maritime disasters. Questions cover the construction of the ship at Harland & Wolff in Belfast, the maiden voyage from Southampton to New York, the iceberg collision on April 14, 1912, and the heroic and tragic stories of the passengers and crew. You'll be asked about the captain Edward Smith, the lifeboats, the rescue ship Carpathia, and the wreck's discovery in 1985.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TitanicQuizSettings),
  reducer,isTerminal,
  hint: (state: TitanicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TitanicQuizGame,
};
