import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen20sQuizState, Nineteen20sQuizAction, Nineteen20sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nineteen20sQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen20sQuizPlugin: GamePlugin<Nineteen20sQuizState, Nineteen20sQuizAction, typeof settings> = {
  id:"1920s-quiz", title:"1920s Roaring Twenties Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of jazz, flappers, prohibition, and the Roaring Twenties.",
  howToPlay:`1920s Roaring Twenties Quiz takes you back to the era of jazz, flappers, prohibition, and the silent film. Questions cover Charles Lindbergh's transatlantic flight, the Harlem Renaissance, the rise of automobiles, the stock market boom, women's suffrage, and the cultural icons of the decade — from Babe Ruth to F. Scott Fitzgerald.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen20sQuizSettings),
  reducer,isTerminal,
  hint: (state: Nineteen20sQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Nineteen20sQuizGame,
};
