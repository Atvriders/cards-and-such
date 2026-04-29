import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TelestrationsUpsideQuizState, TelestrationsUpsideQuizAction, TelestrationsUpsideQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TelestrationsUpsideQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const telestrationsUpsideQuizPlugin: GamePlugin<TelestrationsUpsideQuizState, TelestrationsUpsideQuizAction, typeof settings> = {
  id:"telestrations-upside-quiz", title:"Telestrations Upside Drawn Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the upside-down drawing variant of Telestrations.",
  howToPlay:"Telestrations Upside Drawn Trivia covers everything about the wonderfully chaotic variant of Telestrations where players sketch their clue cards while holding the booklet upside down. Questions explore the standalone box, publisher, recommended player counts, and the unique drawing rule that produces some of the funniest results in party-game history. The quiz gives ten questions total. Pick a choice and press Submit — correct answers earn 100 base points plus 10 points per second remaining on the 15-second timer. A wrong answer reveals the correct one, then Next moves you forward. After question ten, you'll see your final score, which combines accuracy and speed. If you've ever tried to sketch a horse upside down and watched a friend mistake it for a haunted submarine, this quiz will feel like a homecoming. See how much you remember about the silliest twist on the modern drawing classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TelestrationsUpsideQuizSettings),
  reducer,isTerminal,component:TelestrationsUpsideQuizGame,
};
