import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HyakuninIsshuState, HyakuninIsshuAction, HyakuninIsshuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HyakuninIsshuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hyakuninIsshuPlugin: GamePlugin<HyakuninIsshuState, HyakuninIsshuAction, typeof settings> = {
  id:"hyakunin-isshu-quiz", title:"Hyakunin Isshu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Hyakunin Isshu, the 100-poem Japanese karuta tradition.",
  howToPlay:"Hyakunin Isshu (literally 'one hundred people, one poem each') is an anthology of 100 classical Japanese tanka poems compiled by the poet Fujiwara no Teika in the 13th century. The collection is the basis for the karuta card game where the reader recites the first half of a poem while players race to grab the picture-card showing the second half. Skilled players memorize all 100 poems and can identify each from its opening syllable.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HyakuninIsshuSettings),
  reducer,isTerminal,component:HyakuninIsshuGame,
};
