import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen40sQuizState, Nineteen40sQuizAction, Nineteen40sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nineteen40sQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen40sQuizPlugin: GamePlugin<Nineteen40sQuizState, Nineteen40sQuizAction, typeof settings> = {
  id:"1940s-quiz", title:"1940s WWII Era Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"From WWII to the dawn of the atomic age — test your 1940s knowledge.",
  howToPlay:`1940s WWII Era Quiz covers the defining decade of the 20th century — World War II, the Holocaust, the Manhattan Project, D-Day, the founding of the United Nations, and the start of the Cold War. Music swung, GIs returned home, and television began to enter American living rooms.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen40sQuizSettings),
  reducer,isTerminal,
  hint: (state: Nineteen40sQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Nineteen40sQuizGame,
};
