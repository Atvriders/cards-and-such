import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OjTrialQuizState, OjTrialQuizAction, OjTrialQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OjTrialQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ojTrialQuizPlugin: GamePlugin<OjTrialQuizState, OjTrialQuizAction, typeof settings> = {
  id:"oj-trial-quiz", title:"OJ Simpson Trial Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the People v. Simpson 1995 trial.",
  howToPlay:"OJ Simpson Trial Quiz covers People v. Simpson (1994-1995), one of the most-watched televised criminal trials in American history. The football star turned actor was tried for the murders of Nicole Brown Simpson and Ronald Goldman. The 'Trial of the Century' captivated the nation for nine months and featured a parade of memorable characters and twists.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Bronco chases to bloody gloves, from Cochran to Marcia Clark, the trial that gripped a nation lives on in every question.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OjTrialQuizSettings),
  reducer,isTerminal,component:OjTrialQuizGame,
};
