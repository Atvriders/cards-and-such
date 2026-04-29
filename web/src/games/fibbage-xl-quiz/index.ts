import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FibbageXlQuizState, FibbageXlQuizAction, FibbageXlQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FibbageXlQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fibbageXlQuizPlugin: GamePlugin<FibbageXlQuizState, FibbageXlQuizAction, typeof settings> = {
  id:"fibbage-xl-quiz", title:"Fibbage XL Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Fibbage XL: the 500-extra-question expansion to the original.",
  howToPlay:"Fibbage XL Trivia tests your knowledge of the expanded version of original Fibbage — the bluff-trivia entry packed with about 500 additional questions for huge replay value. Topics include its Pack number, supported players, the audience mode, and the bluff-and-answer scoring system. Each round delivers ten questions. Tap an answer and press Submit. A correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer, so quick reads pay off. A wrong answer reveals the correct choice and disables further input; press Next to advance. After question ten, your final score is shown. Whether you've played Fibbage XL with a packed family room or used it to break the ice at a remote work party, this quiz will measure how thoroughly you know the rules and design of the expanded edition.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FibbageXlQuizSettings),
  reducer,isTerminal,component:FibbageXlQuizGame,
};
