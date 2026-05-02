import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen80sQuizState, Nineteen80sQuizAction, Nineteen80sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nineteen80sQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen80sQuizPlugin: GamePlugin<Nineteen80sQuizState, Nineteen80sQuizAction, typeof settings> = {
  id:"1980s-quiz", title:"1980s Pop Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"MTV, Madonna, Reagan, and the fall of the Berlin Wall — the 1980s.",
  howToPlay:`1980s Pop Culture Quiz covers Reagan, MTV, the Cold War endgame, Madonna, Michael Jackson, the rise of personal computers, the fall of the Berlin Wall, big hair, blockbuster films, and Saturday morning cartoons. The decade where pop culture exploded.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen80sQuizSettings),
  reducer,isTerminal,
  hint: (state: Nineteen80sQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Nineteen80sQuizGame,
};
