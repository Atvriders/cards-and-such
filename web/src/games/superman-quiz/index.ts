import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SupermanQuizState, SupermanQuizAction, SupermanQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SupermanQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const supermanQuizPlugin: GamePlugin<SupermanQuizState, SupermanQuizAction, typeof settings> = {
  id:"superman-quiz", title:"Superman Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Superman lore: Krypton, the Daily Planet, the Fortress of Solitude, and the Man of Steel.",
  howToPlay:`Superman Quiz tests your knowledge of DC Comics' Man of Tomorrow. Questions cover Clark Kent's life on Krypton and Earth, the House of El, Kryptonite in all its colors, the Fortress of Solitude, the Daily Planet — Lois Lane, Jimmy Olsen, Perry White — and Superman's enemies, from Lex Luthor and Brainiac to General Zod, Doomsday, Bizarro, and Mister Mxyzptlk.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Up, up, and away — see if you can leap a tall trivia question in a single bound!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SupermanQuizSettings),
  reducer,isTerminal,
  hint: (state: SupermanQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SupermanQuizGame,
};
