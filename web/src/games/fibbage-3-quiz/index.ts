import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Fibbage3QuizState, Fibbage3QuizAction, Fibbage3QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fibbage3QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fibbage3QuizPlugin: GamePlugin<Fibbage3QuizState, Fibbage3QuizAction, typeof settings> = {
  id:"fibbage-3-quiz", title:"Fibbage 3 Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Fibbage 3 and its Enough About You spinoff mode.",
  howToPlay:"Fibbage 3 Trivia covers the third major Fibbage entry — the one that added 'Enough About You,' a mode where prompts come from player-submitted facts about themselves. Questions explore the Jackbox Pack number, the player counts, audience modes, and the gameplay differences from earlier Fibbage entries. Each round has ten questions. Tap an answer and press Submit. Correct answers award 100 base points plus 10 points per second remaining on the 15-second timer; wrong ones reveal the correct option and lock further input. Press Next to advance. After ten questions, your final score is displayed. If you've laughed at a coworker's lie passed off as a truth on a streamed Jackbox night, or fooled friends with a perfectly plausible Fibbage answer, this quiz will reveal how thoroughly you know the mechanics behind those great moments.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Fibbage3QuizSettings),
  reducer,isTerminal,component:Fibbage3QuizGame,
};
