import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThingAboutThingsQuizState, ThingAboutThingsQuizAction, ThingAboutThingsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThingAboutThingsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const thingAboutThingsQuizPlugin: GamePlugin<ThingAboutThingsQuizState, ThingAboutThingsQuizAction, typeof settings> = {
  id:"thing-about-things-quiz", title:"The Thing About Things Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about The Thing About Things, where players describe items using awkward adjectives.",
  howToPlay:"The Thing About Things Trivia explores the witty word-play card game where each player describes a hidden noun using an awkward adjective drawn from a deck. Questions cover its publisher, gameplay tone, similar games, recommended player counts, and the rules that drive its absurd improv humor. Each round delivers ten questions. Tap your selected answer and press Submit. A correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer — speed pays. Wrong answers reveal the correct option and disable further input; press Next to advance to the next question. After ten questions, your final score appears. If you've ever had to describe 'a refrigerator' as 'glistening' for an entire round and laughed your way through, this quiz will reveal how much you remember about the rules that make the chaos possible.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThingAboutThingsQuizSettings),
  reducer,isTerminal,component:ThingAboutThingsQuizGame,
};
