import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HelicoptersQuizState, HelicoptersQuizAction, HelicoptersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HelicoptersQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const helicoptersQuizPlugin: GamePlugin<HelicoptersQuizState, HelicoptersQuizAction, typeof settings> = {
  id:"helicopters-quiz", title:"Helicopters History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"From Sikorsky to Apache — test your rotorcraft knowledge.",
  howToPlay:"Helicopters History Quiz takes flight through the world of rotorcraft. From Igor Sikorsky's pioneering VS-300 to the Bell Huey of the Vietnam era, the AH-64 Apache, the heavy-lift Chinook, and modern medical, civilian, and search-and-rescue helicopters, this quiz covers iconic machines and the engineers behind them.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Spin up the rotors and see how high you can fly!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HelicoptersQuizSettings),
  reducer,isTerminal,
  hint: (state: HelicoptersQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HelicoptersQuizGame,
};
