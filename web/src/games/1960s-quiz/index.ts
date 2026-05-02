import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen60sQuizState, Nineteen60sQuizAction, Nineteen60sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nineteen60sQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen60sQuizPlugin: GamePlugin<Nineteen60sQuizState, Nineteen60sQuizAction, typeof settings> = {
  id:"1960s-quiz", title:"1960s Counterculture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"From Beatlemania to the moon landing — test your 1960s knowledge.",
  howToPlay:`1960s Counterculture Quiz covers Beatlemania, the moon landing, civil rights, Vietnam, JFK, Woodstock, hippies, the Cuban Missile Crisis, and the British Invasion. The decade shook politics, music, fashion, and culture worldwide.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen60sQuizSettings),
  reducer,isTerminal,
  hint: (state: Nineteen60sQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Nineteen60sQuizGame,
};
