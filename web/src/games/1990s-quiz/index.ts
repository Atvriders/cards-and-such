import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen90sQuizState, Nineteen90sQuizAction, Nineteen90sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nineteen90sQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen90sQuizPlugin: GamePlugin<Nineteen90sQuizState, Nineteen90sQuizAction, typeof settings> = {
  id:"1990s-quiz", title:"1990s Internet Boom Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grunge, the Web, the Simpsons, and Y2K — the 1990s.",
  howToPlay:`1990s Internet Boom Quiz covers grunge music, the World Wide Web, Friends, Seinfeld, the fall of the USSR, Bill Clinton, the rise of cell phones, the dot-com boom, hip-hop's golden age, and the looming Y2K bug. A decade of transformation.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen90sQuizSettings),
  reducer,isTerminal,
  hint: (state: Nineteen90sQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Nineteen90sQuizGame,
};
