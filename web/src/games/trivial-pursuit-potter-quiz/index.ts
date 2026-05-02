import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitPotterQuizState, TrivialPursuitPotterQuizAction, TrivialPursuitPotterQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrivialPursuitPotterQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitPotterQuizPlugin: GamePlugin<TrivialPursuitPotterQuizState, TrivialPursuitPotterQuizAction, typeof settings> = {
  id:"trivial-pursuit-potter-quiz", title:"Trivial Pursuit Harry Potter Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia from the Wizarding World edition: Hogwarts, spells, characters, and creatures.",
  howToPlay:"Trivial Pursuit Harry Potter Trivia tests your knowledge of the Wizarding World — the seven novels, the films, the characters, the houses, and the magical creatures of Hogwarts. Each round contains ten questions. Tap your selected answer, then press Submit. A correct answer earns 100 base points plus 10 points for every second still on the 15-second timer, so quick wand work pays. Wrong answers lock in and reveal the right choice; press Next to advance. After ten questions, your final score is displayed. If you have read every book multiple times, can name your favorite Hogwarts house immediately, or own at least one striped scarf, you'll ace this quiz. Otherwise, expect to pick up a few extra spells of trivia knowledge along the way to your final score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitPotterQuizSettings),
  reducer,isTerminal,
  hint: (state: TrivialPursuitPotterQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrivialPursuitPotterQuizGame,
};
