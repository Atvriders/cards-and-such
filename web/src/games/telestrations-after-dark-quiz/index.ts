import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TelestrationsAfterDarkQuizState, TelestrationsAfterDarkQuizAction, TelestrationsAfterDarkQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TelestrationsAfterDarkQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const telestrationsAfterDarkQuizPlugin: GamePlugin<TelestrationsAfterDarkQuizState, TelestrationsAfterDarkQuizAction, typeof settings> = {
  id:"telestrations-after-dark-quiz", title:"Telestrations After Dark Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the adult-themed edition of the drawing-telephone party game.",
  howToPlay:"Telestrations After Dark Trivia tests your knowledge of the grown-up edition of the drawing telephone party game where chains of sketches and guesses degenerate into hilarious confusion. Questions cover its publisher, gameplay flow, prompt themes, recommended player count, and how it differs from the family Telestrations base. There are ten questions total. Tap your selected answer, then press Submit — correct picks award 100 base points plus 10 points for every second still on the 15-second clock. Wrong answers freeze the choices and reveal the correct option, after which you press Next to continue. The game ends after the final question and shows your final score. If you have ever passed a sketchbook around a grown-up dinner party and watched a polite pun spiral into something unprintable, this quiz is for you — see how well you recall the rules behind the chaos.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TelestrationsAfterDarkQuizSettings),
  reducer,isTerminal,component:TelestrationsAfterDarkQuizGame,
};
