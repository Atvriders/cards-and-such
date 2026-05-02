import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitNinetiesQuizState, TrivialPursuitNinetiesQuizAction, TrivialPursuitNinetiesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrivialPursuitNinetiesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitNinetiesQuizPlugin: GamePlugin<TrivialPursuitNinetiesQuizState, TrivialPursuitNinetiesQuizAction, typeof settings> = {
  id:"trivial-pursuit-nineties-quiz", title:"Trivial Pursuit 1990s Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivial Pursuit-style decade trivia focusing entirely on the 1990s.",
  howToPlay:"Trivial Pursuit 1990s Trivia is the decade-edition challenge that draws every question from the 1990s — the decade of grunge rock, dial-up internet, sitcom kings, and Beanie Babies. Topics span TV, film, music, sports, technology, and world events of the 90s. The quiz delivers ten questions per round. Pick an answer and press Submit. Correct answers award 100 base points plus 10 points for each second left on the 15-second clock; wrong answers reveal the correct choice and disable further input. Press Next to advance, and after the tenth question, the final score displays. If you can hum every word of 'Smells Like Teen Spirit,' once played a Tamagotchi all the way to its weird digital end, or remember when a CD player was a state-of-the-art mobile device, this is the quiz where you prove your decade fluency.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitNinetiesQuizSettings),
  reducer,isTerminal,
  hint: (state: TrivialPursuitNinetiesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrivialPursuitNinetiesQuizGame,
};
