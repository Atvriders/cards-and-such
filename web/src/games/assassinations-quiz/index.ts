import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AssassinationsQuizState, AssassinationsQuizAction, AssassinationsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AssassinationsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const assassinationsQuizPlugin: GamePlugin<AssassinationsQuizState, AssassinationsQuizAction, typeof settings> = {
  id:"assassinations-quiz", title:"Famous Assassinations Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of historic political assassinations.",
  howToPlay:"Famous Assassinations Quiz spans history's most consequential political killings: from Caesar to Lincoln, from Archduke Franz Ferdinand to JFK, from Gandhi to MLK. The questions cover the perpetrators, the contexts, the immediate aftermath, and the long-term effects of these violent acts.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. History buffs and political junkies will find a sobering tour through the moments that changed the world.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AssassinationsQuizSettings),
  reducer,isTerminal,
  hint: (state: AssassinationsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AssassinationsQuizGame,
};
