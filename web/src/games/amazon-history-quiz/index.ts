import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmazonHistoryQuizState, AmazonHistoryQuizAction, AmazonHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmazonHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const amazonHistoryQuizPlugin: GamePlugin<AmazonHistoryQuizState, AmazonHistoryQuizAction, typeof settings> = {
  id:"amazon-history-quiz", title:"Amazon History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Amazon's founding, growth, and product expansions.",
  howToPlay:"Amazon History Quiz spans Jeff Bezos's 1994 Seattle launch as an online bookstore, the IPO, expansion into every category, the dot-com survival story, AWS as the cloud goliath, Kindle, Alexa, Prime, Whole Foods, MGM, and the Andy Jassy CEO transition.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From earth's biggest bookstore to the everything store, this quiz tests every era.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AmazonHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: AmazonHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AmazonHistoryQuizGame,
};
