import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EmmyAwardsQuizState, EmmyAwardsQuizAction, EmmyAwardsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EmmyAwardsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const emmyAwardsQuizPlugin: GamePlugin<EmmyAwardsQuizState, EmmyAwardsQuizAction, typeof settings> = {
  id:"emmy-awards-quiz", title:"Emmy Awards Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Emmy Awards.",
  howToPlay:"Emmy Awards Quiz tests your knowledge of television's highest honors. The Primetime Emmys debuted in 1949 and have crowned the medium's best dramas, comedies, and limited series ever since — from I Love Lucy and The Honeymooners through Hill Street Blues, The West Wing, Mad Men, Breaking Bad, Game of Thrones, Succession and more.\n\nQuestions cover record holders like Cloris Leachman and Julia Louis-Dreyfus, multiple-time winners like Frasier, Modern Family and The West Wing, ceremony hosts, snubs and surprises, the Television Academy, and how Emmy categories evolved as TV shifted from networks to streaming platforms.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EmmyAwardsQuizSettings),
  reducer,isTerminal,
  hint: (state: EmmyAwardsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:EmmyAwardsQuizGame,
};
