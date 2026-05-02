import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcademyAwardsQuizState, AcademyAwardsQuizAction, AcademyAwardsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcademyAwardsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const academyAwardsQuizPlugin: GamePlugin<AcademyAwardsQuizState, AcademyAwardsQuizAction, typeof settings> = {
  id:"academy-awards-quiz", title:"Academy Awards Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Oscars.",
  howToPlay:"Academy Awards Quiz tests your knowledge of Hollywood's biggest night. The Academy of Motion Picture Arts and Sciences has handed out the gold-plated statuette since 1929, and across nearly a century the Oscars have crowned classics, sparked controversies, and made and broken careers.\n\nQuestions cover Best Picture winners across decades, top acting and directing nominees, record-holders like Walt Disney with 22 wins and Edith Head with 8, host history, ceremony venues from the Roosevelt Hotel to the Dolby Theatre, and famous oddities — La La Land's mistaken win announcement, Marlon Brando's refusal, and the streaker.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AcademyAwardsQuizSettings),
  reducer,isTerminal,
  hint: (state: AcademyAwardsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AcademyAwardsQuizGame,
};
