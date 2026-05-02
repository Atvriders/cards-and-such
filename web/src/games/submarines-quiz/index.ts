import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SubmarinesQuizState, SubmarinesQuizAction, SubmarinesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SubmarinesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const submarinesQuizPlugin: GamePlugin<SubmarinesQuizState, SubmarinesQuizAction, typeof settings> = {
  id:"submarines-quiz", title:"Submarines Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Subs from Holland to Virginia — test your underwater knowledge.",
  howToPlay:"Submarines Quiz dives deep into the history of underwater warfare and exploration. From Holland's pioneering boats and World War II diesel-electrics to nuclear-powered Ohio-class boomers, attack submarines, and modern AIP designs, this quiz covers the silent service and its many vessels.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Periscope up — let's see how deep your knowledge goes!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SubmarinesQuizSettings),
  reducer,isTerminal,
  hint: (state: SubmarinesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SubmarinesQuizGame,
};
