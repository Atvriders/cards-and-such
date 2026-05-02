import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TonyAwardsQuizState, TonyAwardsQuizAction, TonyAwardsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TonyAwardsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tonyAwardsQuizPlugin: GamePlugin<TonyAwardsQuizState, TonyAwardsQuizAction, typeof settings> = {
  id:"tony-awards-quiz", title:"Tony Awards Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Broadway's Tony Awards.",
  howToPlay:"Tony Awards Quiz tests your knowledge of Broadway's biggest night. The Antoinette Perry Award for Excellence in Broadway Theatre has honored the live theater scene since 1947 and is part of the prestigious EGOT (Emmy-Grammy-Oscar-Tony) circle.\n\nQuestions cover Best Musical and Best Play winners across the years, multi-Tony shows like The Producers and Hamilton, legendary Tony hosts including Hugh Jackman and Neil Patrick Harris, the actresses who hold the most acting Tonys (Audra McDonald, six), and the venues that have hosted the ceremony — from the Beacon to Radio City Music Hall.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TonyAwardsQuizSettings),
  reducer,isTerminal,
  hint: (state: TonyAwardsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TonyAwardsQuizGame,
};
