import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonikersSeriousQuizState, MonikersSeriousQuizAction, MonikersSeriousQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonikersSeriousQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const monikersSeriousQuizPlugin: GamePlugin<MonikersSeriousQuizState, MonikersSeriousQuizAction, typeof settings> = {
  id:"monikers-serious-quiz", title:"Monikers Serious Nonsense Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the Monikers expansion adding new pop-culture and oddity person/thing cards.",
  howToPlay:"Monikers Serious Nonsense Trivia tests your knowledge of the Monikers expansion that adds a fresh deck of pop-culture characters, historical oddities, and weirdly specific people and things. Questions span the publisher, the three round formats, the cards' tone, and how the expansion enhances the base game. Each round has ten questions. Tap an answer and press Submit. A correct answer earns 100 base points plus 10 points for every second remaining on the 15-second timer — fast play scores higher. A wrong answer reveals the correct option and disables further input; press Next to advance. After ten questions, your final score appears. Whether you've explained a card with a single syllable in round three or your Monikers shelf is bursting with expansions, this quiz will gauge your devotion to the evolving-clue masterpiece's expansion universe.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MonikersSeriousQuizSettings),
  reducer,isTerminal,component:MonikersSeriousQuizGame,
};
