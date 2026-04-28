import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeotdaState, SeotdaAction, SeotdaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeotdaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const seotdaPlugin: GamePlugin<SeotdaState, SeotdaAction, typeof settings> = {
  id:"seotda-quiz", title:"Seotda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Seotda, the Korean Hwatu gambling card game.",
  howToPlay:"Seotda is a Korean gambling card game played with a Hwatu (flower card) deck, but using only twenty cards (the months January through October, two cards each). Each player is dealt two cards; the combined value of the two cards forms a hand ranked by traditional names. Players bet, raise, or fold across rounds, and the highest hand wins the pot. Seotda is famous for its evocative hand names like 'gwangttaeng' and is the ancestor of variants like Sutda.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SeotdaSettings),
  reducer,isTerminal,component:SeotdaGame,
};
