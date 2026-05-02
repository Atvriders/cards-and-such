import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Apollo1QuizState, Apollo1QuizAction, Apollo1QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Apollo1QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const apollo1QuizPlugin: GamePlugin<Apollo1QuizState, Apollo1QuizAction, typeof settings> = {
  id:"apollo-1-quiz", title:"Apollo 1 Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Apollo 1 fire that killed three astronauts.",
  howToPlay:"Apollo 1 Quiz tests your knowledge of the tragic NASA accident that delayed the Apollo program. Questions cover the cabin fire on January 27, 1967, the deaths of Gus Grissom, Ed White, and Roger Chaffee during a launch rehearsal test, the design flaws in the command module, and the changes NASA made before resuming crewed missions. You'll be asked about the pure oxygen atmosphere, the inward-opening hatch, the redesigned Block II module, and the mission's eventual planned destination.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Apollo1QuizSettings),
  reducer,isTerminal,
  hint: (state: Apollo1QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Apollo1QuizGame,
};
