import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReggaeQuizState, ReggaeQuizAction, ReggaeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReggaeQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const reggaeQuizPlugin: GamePlugin<ReggaeQuizState, ReggaeQuizAction, typeof settings> = {
  id:"reggae-quiz", title:"Reggae Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Reggae, ska, and dub: Marley, Tosh, Cliff, and the sound of Jamaica.",
  howToPlay:`Reggae Quiz tours the music born in Jamaica that conquered the world. From mento and ska through rocksteady, roots reggae, dub, and dancehall, expect questions about Bob Marley, Peter Tosh, Bunny Wailer, Jimmy Cliff, Lee 'Scratch' Perry, King Tubby, and the sound systems and studios that made Kingston a music capital.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 per second remaining on the clock — speedy answers maximize your score. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the right answer is revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. One love, one quiz — let's see how irie your knowledge really is!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ReggaeQuizSettings),
  reducer,isTerminal,
  hint: (state: ReggaeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ReggaeQuizGame,
};
