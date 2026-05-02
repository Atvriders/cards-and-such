import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OutlawsQuizState, OutlawsQuizAction, OutlawsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OutlawsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const outlawsQuizPlugin: GamePlugin<OutlawsQuizState, OutlawsQuizAction, typeof settings> = {
  id:"outlaws-quiz", title:"Famous Outlaws Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of famous outlaws of the American West and beyond.",
  howToPlay:"Famous Outlaws Quiz covers the legends of the American Wild West and beyond: Jesse James, Billy the Kid, Butch Cassidy, Bonnie & Clyde, Pretty Boy Floyd, John Dillinger, and many more. The questions explore biography, crimes, capture or escape, and the myths surrounding these notorious lawbreakers.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Western fans and crime buffs will love putting their knowledge to the test on the rough riders of history.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OutlawsQuizSettings),
  reducer,isTerminal,
  hint: (state: OutlawsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:OutlawsQuizGame,
};
