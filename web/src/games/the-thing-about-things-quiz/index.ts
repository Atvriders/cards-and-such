import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TheThingAboutThingsQuizState, TheThingAboutThingsQuizAction, TheThingAboutThingsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TheThingAboutThingsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const theThingAboutThingsQuizPlugin: GamePlugin<TheThingAboutThingsQuizState, TheThingAboutThingsQuizAction, typeof settings> = {
  id:"the-thing-about-things-quiz", title:"The Thing About Things Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about The Thing About Things, the awkward-adjective party storytelling card game.",
  howToPlay:"The Thing About Things Trivia is a ten-question quiz about the small-format party card game where players must describe an item assigned to them using only an awkward adjective drawn from a card. Each round you'll be tested on its publisher and designers, the card types (Things and Thing-Adjectives), the round structure, judging, and how points are awarded. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 points per second remaining on the 15-second timer, so move briskly. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. The Thing About Things shines by demanding ridiculous storytelling improv from its players, where the joy is in trying to describe a 'sad' table, a 'judgmental' fork, or a 'romantic' lawnmower. Test how much you remember of its design.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TheThingAboutThingsQuizSettings),
  reducer,isTerminal,component:TheThingAboutThingsQuizGame,
};
