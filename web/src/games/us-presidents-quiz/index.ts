import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UsPresidentsQuizState, UsPresidentsQuizAction, UsPresidentsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UsPresidentsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const usPresidentsQuizPlugin: GamePlugin<UsPresidentsQuizState, UsPresidentsQuizAction, typeof settings> = {
  id:"us-presidents-quiz", title:"US Presidents Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of every US President — from Washington to today.",
  howToPlay:"US Presidents Quiz challenges your knowledge of the men who held America's highest office. Questions span the Founding Fathers, Civil War leaders, Progressive era, the World Wars, the Cold War, and the modern presidency — covering terms in office, party affiliation, signature legislation, defining wars and crises, vice presidents, and famous quotations.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Washington to the White House today, see how presidential your trivia truly is!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UsPresidentsQuizSettings),
  reducer,isTerminal,
  hint: (state: UsPresidentsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:UsPresidentsQuizGame,
};
