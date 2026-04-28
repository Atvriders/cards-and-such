import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TamCucState, TamCucAction, TamCucSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TamCucGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tamCucPlugin: GamePlugin<TamCucState, TamCucAction, typeof settings> = {
  id:"tam-cuc-quiz", title:"Tam Cuc Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Tam Cuc, the Vietnamese chess card game.",
  howToPlay:"Tam Cuc is a Vietnamese folk card game whose 32-card deck represents the pieces of Xiangqi (Chinese chess). Each card belongs to one of two armies — black and red — and ranks from General down to Pawn. Players play tricks, with higher-ranked or appropriate cards capturing lower; combos of pairs and triples are also possible. Tam Cuc combines the structure of Xiangqi with the social play of cards and is a long-standing fixture of Vietnamese village life.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TamCucSettings),
  reducer,isTerminal,component:TamCucGame,
};
