import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GreatTrainRobberyQuizState, GreatTrainRobberyQuizAction, GreatTrainRobberyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GreatTrainRobberyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const greatTrainRobberyQuizPlugin: GamePlugin<GreatTrainRobberyQuizState, GreatTrainRobberyQuizAction, typeof settings> = {
  id:"great-train-robbery-quiz", title:"Great Train Robbery Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 1963 Great Train Robbery and its aftermath.",
  howToPlay:"Great Train Robbery Quiz tests your knowledge of one of Britain's most infamous crimes. On August 8, 1963, a gang of fifteen thieves stopped the Glasgow-to-London Royal Mail train at Bridego Bridge in Buckinghamshire and made off with the equivalent of millions of pounds in used banknotes.\n\nQuestions cover the planners and participants — Bruce Reynolds, Ronnie Biggs, Buster Edwards, Charlie Wilson, Tommy Wisbey, Roy James and the rest — the meticulous planning at Leatherslade Farm, the swift police investigation, the daring later escapes from prison, and the decades-long manhunts that followed.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GreatTrainRobberyQuizSettings),
  reducer,isTerminal,
  hint: (state: GreatTrainRobberyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GreatTrainRobberyQuizGame,
};
