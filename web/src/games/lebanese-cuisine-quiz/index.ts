import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { LebaneseCuisineQuizState, LebaneseCuisineQuizAction, LebaneseCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LebaneseCuisineQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const lebaneseCuisineQuizPlugin: GamePlugin<LebaneseCuisineQuizState, LebaneseCuisineQuizAction, typeof settings> = {
  id:"lebanese-cuisine-quiz", title:"Lebanese Cuisine Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mezze, kibbeh, tabbouleh, and the cuisine of the Levant.",
  howToPlay:`Lebanese Cuisine Quiz tests your knowledge of mezze, kibbeh, tabbouleh, and the cuisine of the Levant. Each question presents four answer choices; select one and submit before the 15-second timer runs out.

Correct answers earn 100 base points plus 10 points for every second you had remaining on the clock — answer quickly to maximize your tally. Wrong answers earn nothing, and the right answer is always revealed before you continue.

Tap a choice to select it (the box turns blue), then press Submit to lock in. Correct selections glow green; incorrect ones turn red while the right answer also lights up. Press Next to advance.

Choose 5 or 10 questions in Settings — Settings, then Questions. The pool is randomized and the choices within each question are shuffled, so even repeated plays feel fresh. Whether you are a casual home cook curious about world cuisine or a dedicated foodie traveler, this quiz is a tasty way to test your knowledge.

Eat well and quiz hard!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LebaneseCuisineQuizSettings),
  reducer,isTerminal,
  hint: (state: LebaneseCuisineQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:LebaneseCuisineQuizGame,
};
