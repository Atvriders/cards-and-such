import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KabaddiCardState, KabaddiCardAction, KabaddiCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KabaddiCardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kabaddiCardPlugin: GamePlugin<KabaddiCardState, KabaddiCardAction, typeof settings> = {
  id:"kabaddi-card-quiz", title:"Kabaddi Card Game Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the card abstraction of the Indian sport Kabaddi.",
  howToPlay:"The Kabaddi Card Game is a card-based abstraction of the Indian contact sport Kabaddi. Cards represent raids and tackles, with players collecting points by completing successful raids while opposing players attempt tackles.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KabaddiCardSettings),
  reducer,isTerminal,component:KabaddiCardGame,
};
