import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DouDiZhuState, DouDiZhuAction, DouDiZhuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DouDiZhuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const douDiZhuPlugin: GamePlugin<DouDiZhuState, DouDiZhuAction, typeof settings> = {
  id:"dou-di-zhu-quiz", title:"Dou Di Zhu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Dou Di Zhu, the Chinese 'Fight the Landlord' card game.",
  howToPlay:"Dou Di Zhu (literally 'Fight the Landlord') is a hugely popular Chinese shedding card game for three players. After bidding, one player is designated the Landlord and plays alone against the other two (the peasants), who form a temporary team. The Landlord receives extra cards and tries to discard their hand first; the peasants try to make either of them shed first. The game uses a 54-card deck with two jokers and is the basis of many Chinese mobile and online games.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DouDiZhuSettings),
  reducer,isTerminal,component:DouDiZhuGame,
};
